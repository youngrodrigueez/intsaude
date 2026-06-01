import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import router from './router/index.js'
import App from './App.vue'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore()
auth.initAxios()

app.use(router)
app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: '#1565C0',
      secondary: '#26A69A',
      positive: '#21BA45',
      negative: '#C10015',
      warning: '#F2C037'
    }
  }
})

app.mount('#app')
