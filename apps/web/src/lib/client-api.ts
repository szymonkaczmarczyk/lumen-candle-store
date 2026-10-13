export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly issues: { path: string; code: string }[] = [],
  ) {
    super(code);
  }
}

export async function apiFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: options.body === undefined ? undefined : { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string; issues?: { path: string; code: string }[] };
    throw new ApiError(response.status, data.error ?? "unknown_error", data.issues);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
