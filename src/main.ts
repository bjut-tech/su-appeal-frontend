import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  Button,
  Cell,
  CellGroup,
  ConfigProvider,
  Field,
  Icon,
  Image,
  NavBar,
  Progress,
  Tabbar,
  TabbarItem
} from 'vant'

import router from './lib/router'

import App from './App.vue'

import './assets/styles/tailwind.css'
import 'vant/es/button/style'
import 'vant/es/cell/style'
import 'vant/es/cell-group/style'
import 'vant/es/dialog/style'
import 'vant/es/field/style'
import 'vant/es/icon/style'
import 'vant/es/image/style'
import 'vant/es/nav-bar/style'
import 'vant/es/notify/style'
import 'vant/es/progress/style'
import 'vant/es/tabbar/style'
import 'vant/es/tabbar-item/style'
import 'vant/es/toast/style'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/app.css'

const app = createApp(App)

app.use(router)

const pinia = createPinia()
app.use(pinia)

app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(ConfigProvider)
app.use(Field)
app.use(Icon)
app.use(Image)
app.use(NavBar)
app.use(Progress)
app.use(Tabbar)
app.use(TabbarItem)

app.mount('#app')
