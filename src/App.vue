<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDark } from '@vueuse/core'
import { showNotify } from 'vant'

import { useStore } from './lib/store'

const store = useStore()

const router = useRouter()
const route = useRoute()

const tabBarRoutes = reactive([
  { path: '/announcements', name: '公告', icon: 'megaphone' },
  { path: '/questions', name: '反馈', icon: 'pencil-square' },
  { path: '/user', name: '我的', icon: 'person-circle' }
])
const isTabBarRoute = computed(() => {
  return tabBarRoutes.some((tabBarRoute) => {
    return route.path === tabBarRoute.path
  })
})

const hasTitle = computed(() => !!route.meta.title)
const title = computed<string>(() => {
  return (route.meta.title as string | undefined) ?? '学生权益墙'
})

const isNotHome = computed(() => {
  return route.path !== '/' && route.redirectedFrom?.path !== '/' && !isTabBarRoute.value
})

const navigateBack = (): void => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace('/')
  }
}

const dark = useDark()

onMounted(() => {
  store.checkApiHealth().then((health) => {
    if (!health) {
      showNotify({
        type: 'danger',
        message: '无法连接到服务器'
      })
    }
  })
})
</script>

<template>
  <van-config-provider :theme="dark ? 'dark' : 'light'">
    <div class="w-full max-w-xl mx-auto">
      <van-nav-bar
        v-if="hasTitle || isNotHome"
        :title="hasTitle ? title : ''"
        :left-text="isNotHome ? '返回' : ''"
        :left-arrow="isNotHome"
        fixed
        placeholder
        @click-left="navigateBack"
      />
      <router-view />
      <van-tabbar
        fixed
        placeholder
        route
        safe-area-inset-bottom
      >
        <van-tabbar-item
          v-for="item of tabBarRoutes"
          :key="item.path"
          :to="item.path"
          icon-prefix="bi"
          :icon="item.icon"
        >
          {{ item.name }}
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </van-config-provider>
</template>