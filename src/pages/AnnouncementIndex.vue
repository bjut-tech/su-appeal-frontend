<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import { formatDate } from '../utils/datetime'
import AttachmentShow from '../components/AttachmentShow.vue'
import CollapseParagraph from '../components/CollapseParagraph.vue'
import PaginatedList from '../components/PaginatedList.vue'
import type { Announcement } from '../types/Announcement'

const store = useStore()

const router = useRouter()

const list = ref<Announcement[]>([])

const onPin = (id: number): void => {
  useAxiosInstance()
    .post(`announcements/${id}/pin`)
    .then(() => {
      showToast({
        type: 'success',
        message: '置顶成功'
      })
      list.value = list.value.map((item) => {
        if (item.id === id) {
          item.pinned = true
        }
        return item
      })
    })
    .catch((e) => {
      console.error(e)
      showToast({
        type: 'fail',
        message: '置顶失败'
      })
    })
}

const onUnpin = (id: number): void => {
  useAxiosInstance()
    .delete(`announcements/${id}/pin`)
    .then(() => {
      showToast({
        type: 'success',
        message: '取消置顶成功'
      })
      list.value = list.value.map((item) => {
        if (item.id === id) {
          item.pinned = false
        }
        return item
      })
    })
    .catch((e) => {
      console.error(e)
      showToast({
        type: 'fail',
        message: '取消置顶失败'
      })
    })
}

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
          <i
            v-if="item.pinned"
            class="bi bi-pin-angle-fill flex-shrink-0 text-xs text-gray-500 dark:text-neutral-400"
          />
          <span
            class="flex-shrink-0 text-xs text-gray-500 dark:text-neutral-400"
            v-text="formatDate(item.createdAt)"
          />
        </div>
        <collapse-paragraph
          class="text-sm text-gray-600 dark:text-neutral-300"
          :text="item.content"
        />
        <attachment-show :attachments="item.attachments" />
        <p
          v-if="item.user"
          class="text-xs text-gray-500 dark:text-neutral-400"
        >
          发布者：{{ item.user.name ?? item.user.uid }}
        </p>
      </div>
      <div
        v-if="store.isAdmin"
        class="flex justify-end px-4 py-3 gap-3 border-t border-gray-200 dark:border-neutral-800"
      >
        <van-button
          v-if="item.pinned"
          type="danger"
          size="small"
          plain
          icon-prefix="bi"
          icon="pin"
          @click="onUnpin(item.id)"
        >
          取消置顶
        </van-button>
        <van-button
          v-else
          type="success"
          size="small"
          plain
          icon-prefix="bi"
          icon="pin-angle"
          @click="onPin(item.id)"
        >
          置顶
        </van-button>
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
