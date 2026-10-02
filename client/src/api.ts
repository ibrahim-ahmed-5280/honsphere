export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || 'The request could not be completed.', response.status, data.details);
  return data as T;
}

export const sendJson = <T>(path: string, method: 'POST' | 'PUT' | 'PATCH', body: unknown) =>
  api<T>(path, { method, body: JSON.stringify(body) });
