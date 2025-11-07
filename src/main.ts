import { createPinia } from 'pinia';
import persistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
// import '@/style/element-variables.scss';
import '@/style/index.css';

const app = createApp(App);
const pinia = createPinia();

// 启用 Vue DevTools
app.config.devtools = true;
app.config.performance = true;

app.use(router);
pinia.use(persistedstate);
app.use(pinia);

app.mount('#app');
