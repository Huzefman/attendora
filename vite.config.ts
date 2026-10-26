import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const preview = process.env.VITE_UI_PREVIEW === 'true' || env.VITE_UI_PREVIEW === 'true'

  return {
    plugins: [react()],
    resolve: {
      alias: [
        ...(preview
          ? [
              {
                find: /^@\/lib\/supabase$/,
                replacement: path.resolve(__dirname, './src/dev/preview/supabase.ts'),
              },
            ]
          : []),
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
      ],
    },
  }
})
