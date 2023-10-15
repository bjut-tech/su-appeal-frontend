<script setup lang="ts">
import { computed } from 'vue'

import { relativeTime } from '../utils/datetime'
import AttachmentShow from './AttachmentShow.vue'
import type { Question } from '../types/Question'

import avatarPlaceholder from '../assets/images/avatar-placeholder.png?url'

const props = defineProps<{
  question: Question
  showUser?: boolean
  showPublished?: boolean
  fullContent?: boolean
  allowAnswer?: boolean
  allowDelete?: boolean
  allowPublish?: boolean
}>()

const emit = defineEmits([
  'delete',
  'publish',
  'unpublish'
])

const content = computed(() => {
  if (props.fullContent) {
    return props.question.content
  }

  return props.question.content.length > 300
    ? `${props.question.content.slice(0, 297)}...`
    : props.question.content
})
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
    <div
      v-if="showUser && question.user"
      class="flex justify-between items-center px-4 py-3 gap-4 border-b border-gray-200 dark:border-neutral-800"
    >
      <div class="flex gap-2 items-center">
        <van-image
          class="w-10 h-10"
          round
          fit="fill"
          :src="avatarPlaceholder"
        />
        <div class="flex flex-col">
          <span
            class="text-sm text-gray-600 dark:text-neutral-300"
            v-text="question.user.name"
          />
          <span
            class="text-xs text-gray-500 dark:text-gray-400"
            v-text="question.user.uid"
          />
        </div>
      </div>
    </div>
    <div
      class="flex flex-col items-stretch p-4"
      :class="{ 'gap-4 whitespace-pre-wrap': fullContent, 'gap-2': !fullContent }"
    >
      <p
        class="text-sm text-gray-600 dark:text-neutral-300"
        v-text="content"
      />
      <attachment-show
        v-if="fullContent"
        :attachments="question.attachments"
      />
      <p
        v-else-if="question.attachments.length"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        以及 {{ question.attachments.length }} 个附件
      </p>
    </div>
    <div class="flex justify-between items-center px-4 py-3 gap-4 border-t border-gray-200 dark:border-neutral-800">
      <div class="flex-shrink-0 inline-flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
        <span>反馈于{{ relativeTime(question.updatedAt) }}</span>
        <span v-if="question.answer">回复于{{ relativeTime(question.answer.updatedAt) }}</span>
        <span
          v-else
          :class="{ 'text-red-500': allowAnswer }"
        >未答复</span>
        <span
          v-if="question.published"
          class="text-brand"
        >已公布</span>
      </div>
      <div class="flex items-center gap-3">
        <template v-if="allowPublish">
          <van-button
            v-if="question.published"
            type="danger"
            size="small"
            plain
            icon-prefix="bi"
            icon="x-lg"
            @click="emit('unpublish')"
          >
            取消公布
          </van-button>
          <van-button
            v-else
            type="primary"
            size="small"
            plain
            icon-prefix="bi"
            icon="megaphone"
            @click="emit('publish')"
          >
            公布
          </van-button>
        </template>
        <van-button
          v-if="allowDelete"
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
  </div>
</template>
