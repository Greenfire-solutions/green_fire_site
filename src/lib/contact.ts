export type ContactPayload = {
  name?: string;
  email: string;
  subject?: string;
  message: string;
};

export async function sendContact(
  payload: ContactPayload,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (response.ok && data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: data.error || 'Could not send your message. Please try again.',
    };
  } catch {
    return {
      success: false,
      error: 'Network error. Check your connection and try again.',
    };
  }
}
