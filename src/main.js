import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import store from './store'
import './api/mock.js' //删了就404
const app = createApp(App)

app.use(store)
app.use(Antd)
app.use(router)
app.mount('#app')


