import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

import { useStore } from './store'
import { showNotify } from 'vant'

let instance: AxiosInstance | null = null
export const useAxiosInstance = (): AxiosInstance => {
  if (instance === null) {
    instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    })

    instance.interceptors.request.use((config) => {
      const store = useStore()

      if (store.token) {
        config.headers.Authorization = `Bearer ${store.token}`
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
