import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [vue()],
	build: {
		polyfillModulePreload: false,
	},
	server: {
		hmr: false,
	}
})
