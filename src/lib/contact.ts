export type ContactPayload = {
  name?: string;
  email: string;
  subject?: string;
  message: string;
};

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

function getAccessKey(): string | undefined {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (typeof key === 'string' && key.trim().length > 0) {
    return key.trim();
  }
  return undefined;
}

type Web3FormsResponse = {
  success: boolean;
  message?: string;
  body?: { message?: string };
};

export function isEmailConfigured(): boolean {
  return Boolean(getAccessKey());
}

export function getEmailConfigError(): string {
  return (
    'Contact email is not configured yet. Add VITE_WEB3FORMS_ACCESS_KEY in Vercel ' +
    '(Settings → Environment Variables), then redeploy. See EMAIL_SETUP.md.'
  );
}

/**
 * Sends via Web3Forms from the browser (required on free plan — server-side calls are blocked).
 */
export async function sendContact(
  payload: ContactPayload,
): Promise<{ success: true } | { success: false; error: string }> {
  const accessKey = getAccessKey();
  if (!accessKey) {
    return { success: false, error: getEmailConfigError() };
  }

  const fullMessage = payload.subject
    ? `${payload.message.trim()}\n\n—\nTopic: ${payload.subject}`
    : payload.message.trim();

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: payload.subject?.trim() || 'Green Fire — website message',
        name: payload.name?.trim() || 'Website visitor',
        email: payload.email.trim(),
        message: fullMessage,
        botcheck: '',
      }),
    });

    let data: Web3FormsResponse;
    try {
      data = (await response.json()) as Web3FormsResponse;
    } catch {
      return {
        success: false,
        error: 'Unexpected response from email service. Please try again.',
      };
    }

    if (data.success) {
      return { success: true };
    }

    const detail = data.body?.message || data.message;
    return {
      success: false,
      error: detail || 'Could not send your message. Please try again.',
    };
  } catch {
    return {
      success: false,
      error: 'Network error. Check your connection and try again.',
    };
  }
}
