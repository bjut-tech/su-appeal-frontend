import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

import { useAxiosInstance } from './axios'
import type { User, UserPrincipal } from '../types/User.ts'

export const useStore = defineStore('app', () => {
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
        logout()
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
    loggedIn,
    logout,
    roles,
    token,
    user
  }
})
