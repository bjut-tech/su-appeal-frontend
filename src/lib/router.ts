import { createRouter, createWebHistory } from 'vue-router'

import { useStore } from './store'
import About from '../pages/About.vue'
import AdminAdminList from '../pages/AdminAdminList.vue'
import AdminIndex from '../pages/AdminIndex.vue'
import AdminServerStatus from '../pages/AdminServerStatus.vue'
import AnnouncementIndex from '../pages/AnnouncementIndex.vue'
import AnnouncementCreate from '../pages/AnnouncementCreate.vue'
import NotFound from '../pages/NotFound.vue'
import UserIndex from '../pages/UserIndex.vue'
import UserLogin from '../pages/UserLogin.vue'

const routes = [
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
    path: '/admin',
    component: AdminIndex,
    meta: {
      title: '管理员菜单',
      auth: 'ADMIN'
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
    path: '/user',
    component: UserIndex
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
      return '/login'
    }

    if (typeof to.meta.auth === 'string' && !store.roles.includes(to.meta.auth)) {
      // logged in, but not authorized, return 404
      return '/not-found'
    }
  }

  return true
})

export default router
