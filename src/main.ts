import { createApp } from 'vue'
import App from './App.vue'
import './assets/style/index.scss'

createApp(App).mount('#app').$nextTick(() => postMessage({ payload: 'removeLoading' }, '*'))
