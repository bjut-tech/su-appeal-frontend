<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, closeToast } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'
import type { TokenResponse } from '../types/login.ts'

const router = useRouter()

const store = useStore()

onMounted(() => {
  showToast({
    type: 'loading',
    message: '请稍候...',
    forbidClick: true,
    duration: 0
  })

  useAxiosInstance().post<TokenResponse>('token/exchange', null, {
    withCredentials: true
  }).then(({ data }) => {
    closeToast()
    showToast({
      type: 'success',
      message: '登录成功',
      duration: 1000
    })

    store.token = data.access_token

    if (data.expires_in) {
      store.tokenExpiry = Date.now() + data.expires_in * 1000
    }

    const url = sessionStorage.getItem('intendedUrl') ?? '/user'
    sessionStorage.removeItem('intendedUrl')

    router.replace(url)
  }).catch((e) => {
    console.error(e)

    closeToast()
    showToast({
      type: 'fail',
      message: '登录失败',
      duration: 1000
    })

    router.replace('/user')
  })
})
</script>
