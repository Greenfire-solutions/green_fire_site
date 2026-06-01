import type { VercelRequest, VercelResponse } from '@vercel/node';

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(503).json({
      error: 'Email service is not configured. Add WEB3FORMS_ACCESS_KEY in Vercel environment variables.',
    });
  }

  const { name, email, subject, message } = req.body as ContactBody;

  if (!email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: subject?.trim() || 'Green Fire — website message',
        from_name: name?.trim() || 'Website visitor',
        email: email.trim(),
        message: message.trim(),
      }),
    });

    const data = (await response.json()) as { success?: boolean; message?: string };

    if (data.success) {
      return res.status(200).json({ success: true });
    }

    return res.status(502).json({
      error: data.message || 'Could not send your message. Please try again.',
    });
  } catch {
    return res.status(502).json({ error: 'Could not send your message. Please try again.' });
  }
}
