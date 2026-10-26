/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Development-only: run the app against synthetic in-memory data. */
  readonly VITE_UI_PREVIEW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
