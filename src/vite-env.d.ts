/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ANALYTICS_CF_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
