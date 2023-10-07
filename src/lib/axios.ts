import axios from 'axios'
import type { AxiosInstance } from 'axios'

import { useStore } from './store'

let instance: AxiosInstance | null = null
export const useAxiosInstance = (): AxiosInstance => {
  if (instance === null) {
    instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    })

    instance.interceptors.request.use((config) => {
      const userStore = useStore()

      if (userStore.token) {
        config.headers.Authorization = `Bearer ${userStore.token}`
      }

      return config
    })
  }

  return instance
}
