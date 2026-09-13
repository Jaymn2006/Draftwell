import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set BASE to your GitHub repo name, e.g. '/draftwell/'
// If deploying to a custom domain or user/org page (username.github.io), set to '/'
const base = process.env.VITE_BASE_PATH ?? '/draftwell/'

export default defineConfig({
	base,
	plugins: [react()],
	server: {
		watch: {
			ignored: ['**/dist/**'],
		},
	},
})
