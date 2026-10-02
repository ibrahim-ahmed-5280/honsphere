import { sendJson } from '../api';

export async function uploadImage(file: File) {
  if (file.size > 2_000_000) throw new Error('Choose an image under 2 MB.');
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
  return sendJson<{ url: string }>('/admin/uploads', 'POST', { filename: file.name, dataUrl });
}
