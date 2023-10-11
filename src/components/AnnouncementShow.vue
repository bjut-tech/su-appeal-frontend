<script setup lang="ts">
import { computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import { getUrl } from '../utils/attachment'
import { relativeTime } from '../utils/datetime'
import { isImage } from '../utils/filetype'
import AttachmentList from './AttachmentList.vue'
import ImagesGrid from './ImagesGrid.vue'
import type { AnnouncementShow } from '../types/Announcement'
import type { Attachment } from '../types/Attachment'

const props = defineProps<{
  announcement: AnnouncementShow
}>()

const emit = defineEmits([
  'deleted'
])

const store = useStore()

const images = computed<string[]>(() => {
  return props.announcement.attachments.filter((attachment) => {
    return isImage(attachment.name)
  }).map((attachment) => getUrl(attachment))
})

const files = computed<Attachment[]>(() => {
  return props.announcement.attachments.filter((attachment) => {
    return !isImage(attachment.name)
  })
})

const onDelete = (): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这则公告吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`announcements/${props.announcement.id}`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        emit('deleted')
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
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow">
    <div class="flex flex-col items-stretch gap-4 p-4">
      <div class="flex items-center gap-2">
        <div class="flex-shrink-0 w-1 h-5 rounded bg-brand" />
        <h5
          class="flex-1 font-semibold"
          v-text="announcement.title"
        />
        <span
          class="flex-shrink-0 text-xs text-gray-500 dark:text-neutral-400"
          v-text="relativeTime(announcement.createdAt)"
        />
      </div>
      <p
        class="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-wrap"
        v-text="announcement.content"
      />
      <images-grid
        v-if="images.length"
        :images="images"
      />
      <attachment-list
        v-if="files.length"
        :attachments="files"
      />
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
        @click="onDelete"
      >
        删除
      </van-button>
    </div>
  </div>
</template>
