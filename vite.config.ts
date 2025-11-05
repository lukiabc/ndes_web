import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()], // 按需加载 UI 框架组件
            imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'], // 自动导入
            dts: './src/auto-imports.d.ts', // 生成类型声明文件
        }),
        Components({
            resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // 自动导入定制化样式文件进行样式覆盖
                additionalData: `
          @use "@/style/element-variables.scss" as *;
        `,
            },
        },
    },
});
