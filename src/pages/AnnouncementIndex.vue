<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import AnnouncementShowComponent from '../components/AnnouncementShow.vue'
import type { AnnouncementShow } from '../types/Announcement'
import type { CursorPagination } from '../types/pagination'

const store = useStore()

const router = useRouter()

const axios = useAxiosInstance()

const list = ref<AnnouncementShow[]>([])
const cursor = ref<string | null>(null)

const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const onLoad = (): void => {
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
  error.value = false
  refreshing.value = true
  onLoad()
}

const onDeleted = (id: number): void => {
  list.value = list.value.filter((item) => item.id !== id)
}

const goCreate = (): void => {
  router.push('/announcements/create')
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
      finished-text="到底了"
      error-text="请求失败，点击重新加载"
      @load="onLoad"
    >
      <template v-if="store.isAdmin">
        <div
          class="flex justify-center items-center px-4 py-16 bg-white dark:bg-neutral-900 rounded-lg cursor-pointer select-none"
          role="link"
          @click="goCreate"
        >
          <h5 class="text-sm text-gray-500 dark:text-neutral-400 font-medium">
            点击发布新公告
          </h5>
        </div>
        <hr class="my-2 border-gray-200 dark:border-neutral-800">
      </template>
      <announcement-show-component
        v-for="item of list"
        :key="item.id"
        :announcement="item"
        @deleted="onDeleted(item.id)"
      />
    </van-list>
  </van-pull-refresh>
</template>
