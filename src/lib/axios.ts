import axios from 'axios'
import { showNotify } from 'vant'
import type { AxiosInstance, AxiosError } from 'axios'

import { useStore } from './store.ts'

let instance: AxiosInstance | null = null
export const useAxiosInstance = (): AxiosInstance => {
  if (instance === null) {
    instance = axios.create({
      baseURL: '/api'
    })

    instance.interceptors.request.use((config) => {
      const store = useStore()

      if (store.token) {
        config.headers.Authorization = `Bearer ${store.token}`
      } else if (store.tokenSecondary) {
        config.headers.Authorization = `Bearer ${store.tokenSecondary}`
      }

      return config
    })

    instance.interceptors.response.use(undefined, (error: AxiosError) => {
      if (!error?.response?.status || error.response.status >= 502) {
        showNotify({
          type: 'danger',
          message: '无法连接到服务器'
        })
      } else if (error?.response?.status === 401 && !error?.config?.url?.includes('token')) {
        useStore().logout()
        showNotify({
          type: 'warning',
          message: '登录状态失效，请重新登录'
        })
      }

      throw error
    })
  }

  return instance
}
