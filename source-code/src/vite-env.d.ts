/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_POLL_INTERVAL_MS: string
  readonly VITE_ALERT_COOLDOWN_MIN: string
  readonly VITE_ALERT_WEBHOOK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
