import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast } from 'vant'

import { useAxiosInstance } from './axios.ts'
import browsers from '../utils/browser.ts'
import type { User, UserPrincipal } from '../types/user.ts'

export const useStore = defineStore('app', () => {
  const isWeixin = ref<boolean>(browsers.isWeixin())

  const token = useLocalStorage('token', '')

  const tokenExpiry = useLocalStorage('token_expiry', -1)

  const tokenSecondary = useLocalStorage('token_secondary', '')

  const tokenSecondaryExpiry = useLocalStorage('token_secondary_expiry', -1)

  const {
    data: userPrincipal,
    execute: fetchUser
  } = useAxios<UserPrincipal>('user', useAxiosInstance(), {
    immediate: false,
    initialData: null,
    onError: (e) => {
      console.error(e)
      showToast('加载用户信息失败')
    }
  })

  const user = computed<User | null>(() => {
    return userPrincipal.value?.user ?? null
  })

  const roles = computed<string[]>(() => {
    return userPrincipal.value?.authorities.map((auth) => auth.authority) ?? []
  })

  const loggedIn = computed<boolean>(() => !!userPrincipal.value)

  const isAdmin = computed<boolean>(() => roles.value.includes('ADMIN'))

  const logout = (): void => {
    token.value = ''
    tokenExpiry.value = -1
    userPrincipal.value = undefined
  }

  const logoutSecondary = (): void => {
    tokenSecondary.value = ''
    tokenSecondaryExpiry.value = -1
  }

  return {
    fetchUser,
    isAdmin,
    isWeixin,
    loggedIn,
    logout,
    logoutSecondary,
    roles,
    token,
    tokenExpiry,
    tokenSecondary,
    tokenSecondaryExpiry,
    user
  }
})
