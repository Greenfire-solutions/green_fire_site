/* Booking a Zoom call from the /onboard form. The calendar, the free times and
   the Zoom meeting all live in Book It (cal.greenfire.earth, always on), so this
   file only carries a request there and back. It holds no calendar key and no
   Zoom key. Two Vercel env vars:
     BOOKIT_HOOK_TOKEN   Book It's hook token (the Mac keychain, service book-it, account hook)
     BOOKIT_URL          optional, defaults to https://cal.greenfire.earth
   Without the token the form simply does not offer a time and says Jordan will
   write instead. No em dashes in anything a person reads. */
import crypto from 'crypto';

const URL_ = () => (process.env.BOOKIT_URL || 'https://cal.greenfire.earth').replace(/\/$/, '');
const TOKEN = () => process.env.BOOKIT_HOOK_TOKEN || '';
export const enabled = () => Boolean(TOKEN());

/* A person may book only after they finished the form: the form hands back this
   stamp (their email, signed, good for 3 days) and the booking must carry it. */
const sign = (email: string, exp: number) => crypto.createHmac('sha256', TOKEN() + ':sched').update(`${email}|${exp}`).digest('base64url');
export function stamp(email: string): string {
  if (!enabled()) return '';
  const exp = Date.now() + 3 * 24 * 3600 * 1000;
  return `${exp}.${sign(email.toLowerCase(), exp)}`;
}
export function stampOk(email: string, s: unknown): boolean {
  if (!enabled() || typeof s !== 'string') return false;
  const [exp, sig] = s.split('.');
  const e = Number(exp);
  if (!e || e < Date.now() || !sig) return false;
  const want = sign(email.toLowerCase(), e);
  return sig.length === want.length && crypto.timingSafeEqual(Uint8Array.from(Buffer.from(sig)), Uint8Array.from(Buffer.from(want)));
}

type Reply = { status: number; json: Record<string, unknown> };
async function bookit(path: string, body?: unknown): Promise<Reply> {
  try {
    const r = await fetch(URL_() + path, {
      method: body ? 'POST' : 'GET',
      headers: { authorization: 'Bearer ' + TOKEN(), 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(9000),
    });
    return { status: r.status, json: (await r.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { status: 503, json: { error: 'down' } };
  }
}

export const LENGTHS = [20, 30, 45, 60];
export async function slots(length: number) {
  const len = LENGTHS.includes(length) ? length : 30;
  const r = await bookit(`/hook/slots?length=${len}&days=14`);
  if (r.status !== 200 || !r.json.ok) return { ok: false as const };
  const list = (r.json.slots as { start: string; end: string }[]) || [];
  return { ok: true as const, length: len, slots: list.map((s) => s.start) };
}

export async function book(d: { name: string; email: string; phone: string; business: string; start: string; length: number; visitorTz: string; notes: string }) {
  return bookit('/hook/schedule', d);
}

/* The calendar file a person taps to save the call. PUBLISH, not REQUEST: it is
   an event to keep, not an invitation that expects a reply. */
const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const fold = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
export function ics(o: { id: string; start: string; end: string; url: string | null; name: string }): string {
  const desc = `Your Greenfire call with Jordan.${o.url ? ' Join on Zoom: ' + o.url : ''}`;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Greenfire//Onboarding//EN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${o.id}@greenfire.earth`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(o.start)}`, `DTEND:${icsDate(o.end)}`,
    'SUMMARY:Greenfire call with Jordan', `DESCRIPTION:${fold(desc)}`, o.url ? `LOCATION:${fold(o.url)}` : '', 'END:VEVENT', 'END:VCALENDAR']
    .filter(Boolean).join('\r\n') + '\r\n';
}

/* "Tuesday, Dec 1, 3:00 PM CST" in the person's own zone (a bad zone name falls back to Central). */
export function whenIn(iso: string, tz: string): string {
  const zone = (() => { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch { return 'America/Chicago'; } })();
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(d);
  return `${day}, ${time}`;
}
