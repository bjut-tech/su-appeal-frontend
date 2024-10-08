<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDark } from '@vueuse/core'

import { useSchool } from './lib/school.ts'
import { useStore } from './lib/store.ts'

const school = useSchool()

const store = useStore()

const route = useRoute()

const router = useRouter()

const tabBarRoutes = reactive([
  { path: '/announcements', name: '公告', icon: 'megaphone' },
  { path: '/questions/create', name: '反馈', icon: 'pencil-square' },
  { path: '/questions', name: '答复', icon: 'chat-left-text' },
  { path: '/user', name: '我的', icon: 'person-circle' }
])

const isTabBarRoute = computed(() => {
  return tabBarRoutes.some((tabBarRoute) => {
    return route.path === tabBarRoute.path
  })
})

const hasTitle = computed(() => !!route.meta.title)

const title = computed<string>(() => {
  return route.meta?.title ?? (school.value.name + '权益墙')
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
</script>

<template>
  <van-config-provider :theme="dark ? 'dark' : 'light'">
    <div class="w-full max-w-xl min-h-screen mx-auto">
      <van-nav-bar
        v-if="!store.isWeixin && (hasTitle || isNotHome)"
        :title="hasTitle ? title : ''"
        :left-text="isNotHome ? '返回' : ''"
        :left-arrow="isNotHome"
        fixed
        placeholder
        @click-left="navigateBack"
      />
      <router-view />
      <van-tabbar
        v-if="isTabBarRoute"
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
