<script setup lang="ts">
import { ref } from 'vue'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import { relativeTime } from '../utils/datetime'
import type { AnnouncementShow } from '../types/Announcement'
import type { CursorPagination } from '../types/pagination'

const store = useStore()

const axios = useAxiosInstance()

const list = ref<AnnouncementShow[]>([])
const cursor = ref<string | null>(null)

const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const onLoad = (): void => {
  loading.value = true
  axios.get<CursorPagination<AnnouncementShow>>('announcements', {
    params: {
      cursor: cursor.value
    }
  }).then(({ data }) => {
    list.value = [...list.value, ...data.data]
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
  list.value = []
  cursor.value = null
  refreshing.value = true
  onLoad()
}
</script>

<template>
  <van-pull-refresh
    v-model="refreshing"
    :disabled="loading"
    @refresh="onRefresh"
  >
    <van-list
      v-model:loading="loading"
      v-model:error="error"
      class="flex flex-col px-4 py-6 gap-4"
      loading-text="正在加载更多数据..."
      :finished="finished"
      finished-text="没有更多了"
      error-text="请求失败，点击重新加载"
      @load="onLoad"
    >
      <div
        v-for="item of list"
        :key="item.id"
        class="flex flex-col items-stretch gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow"
      >
        <div class="flex justify-between items-center gap-2">
          <h5 class="font-semibold">
            <i class="bi bi-megaphone-fill" />
            {{ item.title }}
          </h5>
          <span class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
            {{ relativeTime(item.createdAt) }}
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ item.content }}
        </p>
      </div>
    </van-list>
  </van-pull-refresh>
</template>
