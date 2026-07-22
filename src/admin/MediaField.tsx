import { useState } from 'react';
import { uploadAdminMedia } from '../lib/adminApi';

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
  accept?: string;
  allowUpload?: boolean;
  previewImage?: boolean;
};

/** URL field with optional file upload to Vercel Blob (admin only). */
export function MediaField({
  label,
  value,
  onChange,
  placeholder = 'https://…',
  hint,
  accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm',
  allowUpload = true,
  previewImage = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const result = await uploadAdminMedia({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        data: dataUrl,
      });
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-stone-500">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white"
        />
        {allowUpload && (
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20">
            {busy ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept={accept}
              className="hidden"
              disabled={busy}
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>
      {hint && <p className="text-[11px] text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {previewImage && value && !value.includes('youtube') && !value.includes('youtu.be') && (
        <img src={value} alt="" className="mt-1 h-24 w-auto rounded-lg border border-white/10 object-cover" />
      )}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
