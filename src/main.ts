import { createPinia } from 'pinia';
import persistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn'; // 中文语言包

import 'element-plus/dist/index.css';
// import '@/style/element-variables.scss';
import '@/style/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
pinia.use(persistedstate);
app.use(pinia);

app.use(ElementPlus, {
    locale: zhCn, // 配置 Element Plus 为中文
});

app.mount('#app');
