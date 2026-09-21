import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your GitHub repo name if hosted on gh-pages.
// Defaults to '/' in AI Studio.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
	base,
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: 3000,
		allowedHosts: true,
		watch: {
			ignored: ['**/dist/**'],
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
						return 'react-vendor'
					}
					if (id.includes('node_modules/lucide-react')) {
						return 'lucide-icons'
					}
				},
			},
		},
	},
})
