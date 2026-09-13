import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your GitHub repo name.
// Override with VITE_BASE_PATH env var if needed.
const base = '/Draftwell/'

export default defineConfig({
	base,
	plugins: [react()],
	server: {
		watch: {
			ignored: ['**/dist/**'],
		},
	},
})
