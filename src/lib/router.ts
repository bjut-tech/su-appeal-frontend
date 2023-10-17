import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useStore } from './store'
import About from '../pages/About.vue'
import AdminAdminList from '../pages/AdminAdminList.vue'
import AdminServerStatus from '../pages/AdminServerStatus.vue'
import AnnouncementIndex from '../pages/AnnouncementIndex.vue'
import AnnouncementCreate from '../pages/AnnouncementCreate.vue'
import Feedback from '../pages/Feedback.vue'
import Home from '../pages/Home.vue'
import NotFound from '../pages/NotFound.vue'
import QuestionCreate from '../pages/QuestionCreate.vue'
import QuestionCreateSuccess from '../pages/QuestionCreateSuccess.vue'
import QuestionIndex from '../pages/QuestionIndex.vue'
import QuestionShow from '../pages/QuestionShow.vue'
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
    component: Home
  },
  {
    path: '/about',
    component: About,
    meta: {
      title: '关于'
    }
  },
  {
    path: '/about/feedback',
    component: Feedback,
    meta: {
      title: '遇到问题？'
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
      title: '权益墙公告栏'
    }
  },
  {
    path: '/announcements/create',
    component: AnnouncementCreate,
    meta: {
      title: '发布公告',
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
 * Fetch user information
 */
router.beforeEach(async () => {
  const store = useStore()

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
  const store = useStore()

  if (store.isWeixin) {
    nextTick(() => {
      document.title = to.meta?.title ?? '学生权益墙'
    })
  }
})

export default router
