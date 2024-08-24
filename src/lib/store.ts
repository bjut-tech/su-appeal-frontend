import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { showToast } from 'vant'

import { useAxiosInstance } from './axios.ts'
import browsers from '../utils/browser.ts'
import type { User, UserPrincipal } from '../types/user.ts'

export const useStore = defineStore('app', () => {
  const isWeixin = ref<boolean>(browsers.isWeixin())

  const token = useLocalStorage('token', '')
  const tokenExpiry = useLocalStorage('token_expiry', -1)

  const user = ref<User | null>(null)
  const roles = ref<string[]>([])

  const loggedIn = computed<boolean>(() => !!user.value)
  const isAdmin = computed<boolean>(() => roles.value.includes('ADMIN'))

  const fetchUser = async (): Promise<void> => {
    try {
      const { data } = await useAxiosInstance().get<UserPrincipal>('user')
      user.value = data.user
      roles.value = data.authorities.map((auth) => auth.authority)
    } catch (e) {
      console.error(e)
      showToast('加载用户信息失败')
    }
  }

  const logout = (): void => {
    token.value = ''
    tokenExpiry.value = -1
    user.value = null
    roles.value = []
  }

  return {
    fetchUser,
    isAdmin,
    isWeixin,
    loggedIn,
    logout,
    roles,
    token,
    tokenExpiry,
    user
  }
})

export const useCallbackStore = defineStore('callback', () => {
  const selectedCategory = ref<number | null>(null)
  const hasSelectedCategory = ref(false)

  return {
    selectedCategory,
    hasSelectedCategory
  }
})
