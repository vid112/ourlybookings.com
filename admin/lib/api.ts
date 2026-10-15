import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export async function adminApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
