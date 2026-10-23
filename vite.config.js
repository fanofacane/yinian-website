import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署在子路径时（如 GitHub Pages 的 /yinian-website/），构建前设置 BASE_URL=/yinian-website/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react()],
});
