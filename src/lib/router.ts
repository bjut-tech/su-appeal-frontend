import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useSchool } from './school.ts'
import { useStore } from './store.ts'
import About from '../pages/About.vue'
import AdminAdminList from '../pages/AdminAdminList.vue'
import AdminServerStatus from '../pages/AdminServerStatus.vue'
import AnnouncementCarouselCreate from '../pages/AnnouncementCarouselCreate.vue'
import AnnouncementCarouselIndex from '../pages/AnnouncementCarouselIndex.vue'
import AnnouncementCategoryIndex from '../pages/AnnouncementCategoryIndex.vue'
import AnnouncementIndex from '../pages/AnnouncementIndex.vue'
import AnnouncementEdit from '../pages/AnnouncementEdit.vue'
import AnnouncementShow from '../pages/AnnouncementShow.vue'
import NotFound from '../pages/NotFound.vue'
import QuestionCreate from '../pages/QuestionCreate.vue'
import QuestionCreateSuccess from '../pages/QuestionCreateSuccess.vue'
import QuestionIndex from '../pages/QuestionIndex.vue'
import QuestionShow from '../pages/QuestionShow.vue'
import SchoolSwitch from '../pages/SchoolSwitch.vue'
import UserIndex from '../pages/UserIndex.vue'
import UserLogin from '../pages/UserLogin.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    auth?: string | boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/announcements'
  },
  {
    path: '/about',
    component: About,
    meta: {
      title: '关于'
    }
  },
  {
    path: '/admin/admins',
    component: AdminAdminList,
    meta: {
      title: '管理员列表',
      auth: 'ADMIN'
    }
  },
  {
    path: '/admin/server-status',
    component: AdminServerStatus,
    meta: {
      title: '服务器状态',
      auth: 'ADMIN'
    }
  },
  {
    path: '/announcements',
    component: AnnouncementIndex,
    meta: {
      title: '{school}权益墙'
    }
  },
  {
    path: '/announcements/:id',
    component: AnnouncementShow,
    meta: {
      title: '公告详情'
    }
  },
  {
    path: '/announcements/carousels',
    component: AnnouncementCarouselIndex,
    meta: {
      title: '轮播公告管理',
      auth: 'ADMIN'
    }
  },
  {
    path: '/announcements/carousels/create',
    component: AnnouncementCarouselCreate,
    meta: {
      title: '添加轮播公告',
      auth: 'ADMIN'
    }
  },
  {
    path: '/announcements/categories',
    component: AnnouncementCategoryIndex,
    meta: {
      title: '公告类别',
      auth: 'ADMIN'
    }
  },
  {
    path: '/announcements/create',
    component: AnnouncementEdit,
    meta: {
      title: '发布公告',
      auth: 'ADMIN'
    }
  },
  {
    path: '/announcements/:id/edit',
    component: AnnouncementEdit,
    meta: {
      title: '编辑公告',
      auth: 'ADMIN'
    }
  },
  {
    path: '/login',
    component: UserLogin,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/questions',
    component: QuestionIndex,
    meta: {
      title: '已答复反馈'
    }
  },
  {
    path: '/questions/:id',
    component: QuestionShow,
    meta: {
      title: '反馈详情',
      auth: true
    }
  },
  {
    path: '/questions/create',
    component: QuestionCreate,
    meta: {
      title: '反馈问题'
    }
  },
  {
    path: '/questions/create/success',
    component: QuestionCreateSuccess,
    meta: {
      title: '反馈问题'
    }
  },
  {
    path: '/schools',
    component: SchoolSwitch,
    meta: {
      title: '切换学院'
    }
  },
  {
    path: '/user',
    component: UserIndex,
    meta: {
      title: '我的权益墙'
    }
  },
  {
    path: '/user/history',
    component: QuestionIndex,
    props: {
      history: true
    },
    meta: {
      title: '我的反馈历史',
      auth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Format page title
 */
router.beforeEach((to) => {
  if (to.meta?.title) {
    while (to.meta.title.includes('{school}')) {
      to.meta.title = to.meta.title.replace('{school}', useSchool().value.name)
    }
  }
  return true
})

/**
 * Fetch user information
 */
router.beforeEach(async () => {
  const store = useStore()

  if (store.token && store.tokenExpiry !== -1 && store.tokenExpiry < Date.now()) {
    // token expired
    store.logout()
  }

  if (store.token && !store.user) {
    await store.fetchUser()
  }

  return true
})

/**
 * Authorize user
 */
router.beforeEach(async (to) => {
  const store = useStore()

  if (to.meta?.auth) {
    // requires authorization

    if (!store.loggedIn) {
      // not logged in, go to login page
      sessionStorage.setItem('intendedUrl', to.fullPath)
      return '/login'
    }

    if (typeof to.meta.auth === 'string' && !store.roles.includes(to.meta.auth)) {
      // logged in, but not authorized, return 404
      return '/not-found'
    }
  }

  return true
})

/**
 * Change page title
 */
router.afterEach((to) => {
  const school = useSchool()
  const store = useStore()

  const appTitle = school.value.name + '权益墙'
  if (store.isWeixin && to.meta?.title && to.meta.title !== appTitle) {
    document.title = `${to.meta.title} - ${appTitle}`
  } else {
    document.title = appTitle
  }
})

export default router
