<script setup lang="ts">
import { useStore } from '../lib/store.ts'
import { formatDate } from '../utils/datetime.ts'
import AttachmentShow from './AttachmentShow.vue'
import CollapseParagraph from './CollapseParagraph.vue'
import type { Announcement } from '../types/announcement.ts'

defineProps<{
  announcement: Announcement
}>()

const emit = defineEmits([
  'edit',
  'pin',
  'unpin',
  'delete'
])

const store = useStore()
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
    <div class="flex flex-col items-stretch gap-4 p-4">
      <div class="flex items-center gap-2">
        <div
          class="flex-shrink-0 w-1 rounded bg-brand"
          :class="announcement.category ? 'h-10' : 'h-5'"
        />
        <div
          v-if="announcement.category"
          class="flex-1 flex flex-col gap-0.5"
        >
          <div class="flex justify-end items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            <span
              class="flex-1 text-brand font-bold"
              v-text="announcement.category.name"
            />
            <i
              v-if="announcement.pinned"
              class="flex-shrink-0 bi bi-pin-angle-fill"
            />
            <span
              class="flex-shrink-0"
              v-text="formatDate(announcement.createdAt)"
            />
          </div>
          <h5
            class="font-semibold"
            v-text="announcement.title.trim()"
          />
        </div>
        <template v-else>
          <h5
            class="flex-1 font-semibold"
            v-text="announcement.title.trim()"
          />
          <i
            v-if="announcement.pinned"
            class="flex-shrink-0 bi bi-pin-angle-fill text-xs text-gray-500 dark:text-neutral-400"
          />
          <span
            class="flex-shrink-0 text-xs text-gray-500 dark:text-neutral-400"
            v-text="formatDate(announcement.createdAt)"
          />
        </template>
      </div>
      <collapse-paragraph
        v-if="Array.from(announcement.content ?? '').length > 1"
        class="text-sm text-gray-600 dark:text-neutral-300"
        :text="announcement.content.trim()"
      />
      <attachment-show :attachments="announcement.attachments" />
      <p
        v-if="announcement.user"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        发布者：{{ announcement.user.name ?? announcement.user.uid }}
      </p>
    </div>
    <div
      v-if="store.isAdmin"
      class="flex justify-end px-4 py-3 gap-3 border-t border-gray-200 dark:border-neutral-800"
    >
      <van-button
        type="primary"
        size="small"
        plain
        icon-prefix="bi"
        icon="pencil"
        @click="emit('edit')"
      >
        编辑
      </van-button>
      <van-button
        v-if="announcement.pinned"
        type="danger"
        size="small"
        plain
        icon-prefix="bi"
        icon="pin"
        @click="emit('unpin')"
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
        @click="emit('pin')"
      >
        置顶
      </van-button>
      <van-button
        type="danger"
        size="small"
        plain
        icon-prefix="bi"
        icon="trash3"
        @click="emit('delete')"
      >
        删除
      </van-button>
    </div>
  </div>
</template>
