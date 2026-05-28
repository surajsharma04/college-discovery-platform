const defaultApiBase = "http://localhost:4000/api";

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBase;
}

export function apiUrl(path: string) {
  const base = getApiBase().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  try {
    const response = await fetch(apiUrl(path), {
      method: options.method ?? "GET",
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => ({}))) as T;
    return { ok: response.ok, status: response.status, payload };
  } catch {
    return {
      ok: false,
      status: 0,
      payload: {
        message:
          `Unable to connect to the backend. Make sure the backend server is running at ${getApiBase()}.`
      } as T
    };
  }
}
