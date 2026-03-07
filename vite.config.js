import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      symbolId: 'icon-[name]',
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/theme/global.less";@import "@/assets/css/variables.less";`,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'vendor-element';
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia') || id.includes('@vue')) {
              return 'vendor-vue';
            }
            if (id.includes('socket.io') || id.includes('engine.io')) {
              return 'vendor-socket';
            }
            return 'vendor-libs';
          }
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return 'static/img/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name)) {
            return 'static/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'static/fonts/[name]-[hash][extname]';
          }
          if (/\.(mp3|wav|ogg|flac)$/i.test(name)) {
            return 'static/media/[name]-[hash][extname]';
          }
          return 'static/other/[name]-[hash][extname]';
        },
      },
    },
  },
})
