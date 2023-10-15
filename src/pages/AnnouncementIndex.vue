<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import { relativeTime } from '../utils/datetime'
import AttachmentShow from '../components/AttachmentShow.vue'
import PaginatedList from '../components/PaginatedList.vue'
import type { AnnouncementShow } from '../types/Announcement'

const store = useStore()

const router = useRouter()

const list = ref<AnnouncementShow[]>([])

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这则公告吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`announcements/${id}`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        list.value = list.value.filter((item) => item.id !== id)
      })
      .catch((e) => {
        console.error(e)
        showToast({
          type: 'fail',
          message: '删除失败'
        })
      })
  })
}

const goCreate = (): void => {
  router.push('/announcements/create')
}
</script>

<template>
  <paginated-list
    v-model="list"
    url="announcements"
    custom-class="flex flex-col px-4 py-6 gap-4"
    pull-refresh
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

    <div
      v-for="item of list"
      :key="item.id"
      class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm"
    >
      <div class="flex flex-col items-stretch gap-4 p-4">
        <div class="flex items-center gap-2">
          <div class="flex-shrink-0 w-1 h-5 rounded bg-brand" />
          <h5
            class="flex-1 font-semibold"
            v-text="item.title"
          />
          <span
            class="flex-shrink-0 text-xs text-gray-500 dark:text-neutral-400"
            v-text="relativeTime(item.createdAt)"
          />
        </div>
        <p
          class="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-wrap"
          v-text="item.content"
        />
        <attachment-show :attachments="item.attachments" />
      </div>
      <div
        v-if="store.isAdmin"
        class="flex justify-end px-4 py-3 gap-3 border-t border-gray-200 dark:border-neutral-800"
      >
        <van-button
          type="danger"
          size="small"
          plain
          icon-prefix="bi"
          icon="trash3"
          @click="onDelete(item.id)"
        >
          删除
        </van-button>
      </div>
    </div>
  </paginated-list>
</template>
