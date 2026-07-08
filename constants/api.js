import { supabase } from "./supabase";

// Temporary development backend URL. Can be changed from the Profile screen.
export let BACKEND_URL = "https://glitzy-poncho-fool.ngrok-free.dev";

export function setBackendUrl(value) {
  const nextValue = value.trim().replace(/\/+$/, "");

  if (!nextValue) {
    return BACKEND_URL;
  }

  BACKEND_URL = nextValue;
  return BACKEND_URL;
}

// Every backend request now needs a Supabase-issued token. Always re-reads
// getSession() fresh so a refreshed token is picked up automatically
// instead of an old one being cached in a variable.
export async function authFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not logged in");
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }

  return res.json();
}