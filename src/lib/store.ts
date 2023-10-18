import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { showToast } from 'vant'

import { useAxiosInstance } from './axios'
import browsers from '../utils/browser'
import type { User, UserPrincipal } from '../types/User'

export const useStore = defineStore('app', () => {
  const isWeixin = ref<boolean>(browsers.isWeixin())

  const token = useLocalStorage('token', '')
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])

  const loggedIn = computed<boolean>(() => !!user.value)
  const isAdmin = computed<boolean>(() => roles.value.includes('ADMIN'))

  const fetchUser = async (): Promise<void> => {
    try {
      const { data } = await useAxiosInstance().get<UserPrincipal>('user')
      user.value = data.user
      roles.value = data.authorities.map((auth) => auth.authority)
    } catch (e: any) {
      console.error(e)
      if (e?.response?.status === 401) {
        showToast('登录状态失效，请重新登录')
        logout()
        setTimeout(() => {
          location.reload()
        }, 2000)
      } else {
        showToast('加载用户信息失败')
      }
    }
  }

  const logout = (): void => {
    token.value = ''
    user.value = null
    roles.value = []
  }

  const apiHealth = ref<boolean | null>(null)

  const checkApiHealth = async (): Promise<boolean> => {
    try {
      const { data } = await useAxiosInstance().get<{
        status: string
      }>('actuator/health')
      apiHealth.value = data.status === 'UP'
    } catch (e: any) {
      console.error(e)
      apiHealth.value = e?.response?.status === 401
    }

    return apiHealth.value
  }

  return {
    apiHealth,
    checkApiHealth,
    fetchUser,
    isAdmin,
    isWeixin,
    loggedIn,
    logout,
    roles,
    token,
    user
  }
})
