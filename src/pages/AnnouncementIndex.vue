<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'
import AnnouncementShow from '../components/AnnouncementShow.vue'
import PaginatedList from '../components/PaginatedList.vue'
import type { Announcement } from '../types/announcement.ts'

const store = useStore()

const router = useRouter()

const list = ref<Announcement[]>([])

const onEdit = (id: number): void => {
  router.push(`/announcements/${id}/edit`)
}

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
    <announcement-show
      v-for="item of list"
      :key="item.id"
      :announcement="item"
      @edit="onEdit(item.id)"
      @pin="onPin(item.id)"
      @unpin="onUnpin(item.id)"
      @delete="onDelete(item.id)"
    />
  </paginated-list>
</template>
