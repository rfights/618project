// Centralized API base URL with normalization and HTTPS upgrade for Codespaces
// Behavior:
// - In Vite dev, always use relative '/api/v1' so the Vite proxy handles backend calls
//   (avoids mixed-content and CORS issues with localhost in Codespaces)
// - In builds, use VITE_BACKEND_URL when provided, else default to relative '/api/v1'
// - Remove any trailing slashes to avoid accidental double '//'
// - If the page is served over HTTPS and the backend URL is http://, upgrade to https://
//   This prevents mixed-content errors in environments like GitHub Codespaces.

const isDev = !!import.meta.env.DEV
let raw = isDev ? '/api/v1' : import.meta.env.VITE_BACKEND_URL ?? '/api/v1'

// Remove all trailing slashes
let normalized = String(raw).replace(/\/+$/, '')

// Auto-upgrade to HTTPS when the app is served over HTTPS but backend URL is HTTP
if (
  /^http:\/\//i.test(normalized) &&
  typeof window !== 'undefined' &&
  window.location?.protocol === 'https:'
) {
  normalized = normalized.replace(/^http:/i, 'https:')
}

export const BASE = normalized
