import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const CART_COOKIE = "cart_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Read guest cart session ID from cookie (server-side)
export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

// Set a new guest cart session ID (used when cart is first created for a guest)
export async function setCartSessionId(id: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function createCartSessionId(): Promise<string> {
  const id = uuidv4();
  await setCartSessionId(id);
  return id;
}

export async function clearCartSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}
