<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'

const store = useStore()

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const submit = (): void => {
  loading.value = true
  error.value = ''

  if (!form.username || !form.password) {
    error.value = '请输入账号和密码'
    loading.value = false
    return
  }

  useAxiosInstance().post<{
    access_token: string
    expires_in: number
    token_type: 'Bearer'
  }>('token', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(({ data }) => {
    store.token = data.access_token

    if (data.expires_in) {
      store.tokenExpiry = Date.now() + data.expires_in * 1000
    }

    const url = sessionStorage.getItem('intendedUrl') ?? '/user'
    sessionStorage.removeItem('intendedUrl')

    router.replace(url)
  }).catch((e) => {
    if (e.response?.status === 401) {
      error.value = '登录失败，请检查输入的账号和密码是否有误'
    } else if (e.response?.status === 429) {
      error.value = '请求过于频繁，请稍后再试'
    } else {
      console.error(e)
      error.value = '登录失败，请稍后再试'
    }
  }).finally(() => {
    loading.value = false
  })
}
</script>

<template>
  <div class="flex flex-col items-stretch mx-4 py-6 gap-4">
    <h1 class="text-2xl font-semibold text-center">
      统一身份认证登录
    </h1>
    <!--<img
      src="../assets/images/bjut-fit-logo-horizontal.png"
      alt="logo"
      class="mx-auto h-[4.5rem] mt-4 mb-6"
    >-->
    <van-cell-group
      class="!mx-0"
      inset
    >
      <van-field
        v-model="form.username"
        type="text"
        label="账号"
        placeholder="请输入账号"
        icon-prefix="bi"
        left-icon="person-vcard"
        maxlength="32"
        center
        autocomplete="username"
      />
      <van-field
        v-model="form.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        icon-prefix="bi"
        left-icon="key"
        center
        autocomplete="current-password"
        @keydown.enter="submit"
      />
    </van-cell-group>
    <p
      v-show="error && !loading"
      class="text-sm text-red-600"
      v-text="error"
    />
    <van-button
      type="primary"
      block
      :loading="loading"
      loading-text="加载中..."
      @click="submit"
    >
      登录
    </van-button>
    <p class="text-xs text-gray-400 dark:text-neutral-500">
      您输入的密码仅用于向统一认证服务发送请求以验证身份，不会以任何形式保存，请放心使用。
    </p>
  </div>
</template>
