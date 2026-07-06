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
