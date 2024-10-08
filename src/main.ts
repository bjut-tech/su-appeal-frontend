import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  ActionSheet,
  Button,
  Cell,
  CellGroup,
  ConfigProvider,
  Empty,
  Field,
  Icon,
  Image,
  ImagePreview,
  Lazyload,
  List,
  Loading,
  NavBar,
  Picker,
  Popup,
  Progress,
  PullRefresh,
  Swipe,
  SwipeItem,
  Tabbar,
  TabbarItem
} from 'vant'
import '@vant/touch-emulator'

import { injectAnalytics } from './lib/analytics.ts'
import { showConsoleInfo } from './lib/console-info.ts'
import router from './lib/router.ts'

import App from './App.vue'

import './assets/styles/tailwind.css'
import 'vant/es/action-sheet/style'
import 'vant/es/button/style'
import 'vant/es/cell/style'
import 'vant/es/cell-group/style'
import 'vant/es/dialog/style'
import 'vant/es/empty/style'
import 'vant/es/field/style'
import 'vant/es/icon/style'
import 'vant/es/image/style'
import 'vant/es/image-preview/style'
import 'vant/es/lazyload/style'
import 'vant/es/list/style'
import 'vant/es/loading/style'
import 'vant/es/nav-bar/style'
import 'vant/es/notify/style'
import 'vant/es/picker/style'
import 'vant/es/popup/style'
import 'vant/es/progress/style'
import 'vant/es/pull-refresh/style'
import 'vant/es/swipe/style'
import 'vant/es/swipe-item/style'
import 'vant/es/tabbar/style'
import 'vant/es/tabbar-item/style'
import 'vant/es/toast/style'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/app.css'

// don't know why eslint complains about this
// eslint-disable-next-line
const app = createApp(App)

app.use(router)

const pinia = createPinia()
app.use(pinia)

app.use(ActionSheet)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(ConfigProvider)
app.use(Empty)
app.use(Field)
app.use(Icon)
app.use(Image)
app.use(ImagePreview)
app.use(Lazyload)
app.use(List)
app.use(Loading)
app.use(NavBar)
app.use(Picker)
app.use(Popup)
app.use(Progress)
app.use(PullRefresh)
app.use(Swipe)
app.use(SwipeItem)
app.use(Tabbar)
app.use(TabbarItem)

app.mount('#app')

injectAnalytics()
showConsoleInfo()
