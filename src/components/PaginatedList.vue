<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { watchThrottled } from '@vueuse/core'
import type { ListInstance } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import type { CursorPagination } from '../types/misc.ts'

const props = defineProps<{
  modelValue: T[]
  url: string
  params?: Record<string, any>
  pullRefresh?: boolean
  customClass?: string
}>()

const emit = defineEmits([
  'update:modelValue'
])

const listComponent = ref<ListInstance | null>(null)
const check = (): void => listComponent.value?.check()

const axios = useAxiosInstance()

const cursor = ref<string | null>(null)
const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const onLoad = (): void => {
  axios.get<CursorPagination<T>>(props.url, {
    params: {
      ...props.params,
      cursor: cursor.value
    }
  }).then(({ data }) => {
    emit('update:modelValue', [
      ...props.modelValue,
      ...data.data
    ])
    cursor.value = data.cursor

    if (!data.cursor) {
      finished.value = true
    }
  }).catch((e) => {
    console.error(e)
    error.value = true
  }).finally(() => {
    loading.value = false
    refreshing.value = false
  })
}

const onRefresh = (): void => {
  finished.value = false
  cursor.value = null
  error.value = false
  loading.value = true
  emit('update:modelValue', [])
  onLoad()
}

watchThrottled(() => props.params, () => {
  onRefresh()
}, {
  deep: true,
  throttle: 1000
})
</script>

<template>
  <van-pull-refresh
    v-if="pullRefresh"
    v-model="refreshing"
    :disabled="loading"
    @refresh="onRefresh"
  >
    <van-list
      ref="listComponent"
      v-model:loading="loading"
      v-model:error="error"
      :class="customClass"
      loading-text="正在加载更多数据..."
      :finished="finished"
      finished-text="没有更多数据了~"
      error-text="请求失败，点击重新加载"
      @load="onLoad"
    >
      <slot :check="check" />
    </van-list>
  </van-pull-refresh>
  <van-list
    v-else
    ref="listComponent"
    v-model:loading="loading"
    v-model:error="error"
    :class="customClass"
    loading-text="正在加载更多数据..."
    :finished="finished"
    finished-text="没有更多数据了~"
    error-text="请求失败，点击重新加载"
    @load="onLoad"
  >
    <slot :check="check" />
  </van-list>
</template>
