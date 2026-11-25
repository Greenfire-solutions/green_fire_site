/* One email to Jordan when something lands on the site (a form started or
   finished). Plain SMTP over TLS to Gmail, so there is no new dependency and no
   third party sees the answers. It needs one Vercel env var:
     NOTIFY_GMAIL_APP_PASSWORD   a Gmail app password for NOTIFY_FROM
   Without it this does nothing. It NEVER throws and never waits long: a form
   submission must not fail, or be slow, because a notice could not be sent. */
import { connect } from 'node:tls';

const FROM = process.env.NOTIFY_FROM || 'civilizationexplorer@gmail.com';
const TO = process.env.NOTIFY_TO || FROM;

const clean = (s: string) => String(s || '').replace(/[\r\n]+/g, ' ').slice(0, 200);
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');

export async function notify(subject: string, text: string): Promise<void> {
  const pass = (process.env.NOTIFY_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!pass) return;
  try {
    await send(pass, clean(subject), String(text || '').slice(0, 6000), TO);
  } catch (e) {
    console.error('notify failed:', (e as Error).message);
  }
}

/* One email to someone else (a confirmation for a person who just booked a call),
   from the same Gmail account, so a reply lands in Jordan's inbox. `ics` adds a
   calendar file they can tap to save the event. Returns whether it went. */
export async function mailTo(to: string, subject: string, text: string, ics?: string): Promise<boolean> {
  const pass = (process.env.NOTIFY_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!pass || !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/.test(to)) return false;
  try {
    await send(pass, clean(subject), String(text || '').slice(0, 6000), to, ics, 'Jordan at Greenfire');
    return true;
  } catch (e) {
    console.error('mailTo failed:', (e as Error).message);
    return false;
  }
}

function send(pass: string, subject: string, text: string, to: string, ics?: string, fromName = 'Greenfire site'): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = connect({ host: 'smtp.gmail.com', port: 465, servername: 'smtp.gmail.com' });
    const timer = setTimeout(() => { sock.destroy(); reject(new Error('timeout')); }, 8000);
    let buf = '';
    let waiter: ((code: number, line: string) => void) | null = null;
    sock.setEncoding('utf8');
    sock.on('error', e => { clearTimeout(timer); reject(e); });
    sock.on('data', d => {
      buf += d;
      /* A reply is complete when its last line has "NNN " (space, not dash). */
      const lines = buf.split('\r\n');
      const last = lines.filter(Boolean).pop() || '';
      if (/^\d{3} /.test(last) && buf.endsWith('\r\n') && waiter) {
        const w = waiter; waiter = null; buf = '';
        w(Number(last.slice(0, 3)), last);
      }
    });
    const reply = () => new Promise<[number, string]>(r => { waiter = (c, l) => r([c, l]); });
    const cmd = async (line: string, ok: number[]) => {
      sock.write(line + '\r\n');
      const [c, l] = await reply();
      if (!ok.includes(c)) throw new Error(`SMTP ${c} after command: ${l.slice(0, 80)}`);
    };
    (async () => {
      const [c0] = await reply();
      if (c0 !== 220) throw new Error('no SMTP greeting');
      await cmd('EHLO greenfire.earth', [250]);
      await cmd('AUTH LOGIN', [334]);
      await cmd(b64(FROM), [334]);
      await cmd(b64(pass), [235]);
      await cmd(`MAIL FROM:<${FROM}>`, [250]);
      await cmd(`RCPT TO:<${to}>`, [250, 251]);
      await cmd('DATA', [354]);
      /* The body is base64, so no line can start with a dot: no dot stuffing needed. */
      const wrap = (x: string) => (b64(x).match(/.{1,76}/g) || []).join('\r\n');
      const head = [
        `From: ${fromName} <${FROM}>`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${b64(subject)}?=`,
        'MIME-Version: 1.0',
      ];
      const msg = ics
        ? [
            ...head,
            'Content-Type: multipart/mixed; boundary="gfb1"',
            '',
            '--gfb1',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            wrap(text),
            '--gfb1',
            'Content-Type: text/calendar; charset=UTF-8; method=PUBLISH; name="greenfire-call.ics"',
            'Content-Disposition: attachment; filename="greenfire-call.ics"',
            'Content-Transfer-Encoding: base64',
            '',
            wrap(ics),
            '--gfb1--',
          ].join('\r\n')
        : [...head, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap(text)].join('\r\n');
      await cmd(msg + '\r\n.', [250]);
      sock.write('QUIT\r\n');
      sock.end();
    })().then(() => { clearTimeout(timer); resolve(); }).catch(e => { clearTimeout(timer); sock.destroy(); reject(e); });
  });
}
