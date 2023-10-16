<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios'
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
  allowShow?: boolean
  allowDelete?: boolean
  allowPublish?: boolean
}>()

const emit = defineEmits([
  'show',
  'delete',
  'publish',
  'unpublish'
])

const router = useRouter()

const axios = useAxiosInstance()

const content = computed(() => {
  if (props.fullContent) {
    return props.question.content
  }

  return props.question.content.length > 300
    ? `${props.question.content.slice(0, 297)}...`
    : props.question.content
})

const onShow = (): void => {
  if (!props.allowShow) {
    return
  }

  router.push(`/questions/${props.question.id}`)
  emit('show')
}

const onPublish = (): void => {
  if (!props.allowPublish) {
    return
  }

  showConfirmDialog({
    title: '注意',
    message: '确定要公布这则反馈及其回复吗？'
  }).then(() => {
    axios.post(`questions/${props.question.id}/publish`)
      .then(() => {
        showToast({
          type: 'success',
          message: '公布成功'
        })
        emit('publish')
      })
      .catch((e) => {
        console.error(e)
        showToast({
          type: 'fail',
          message: '公布失败'
        })
      })
  })
}

const onUnpublish = (): void => {
  if (!props.allowPublish) {
    return
  }

  axios.post(`questions/${props.question.id}/unpublish`)
    .then(() => {
      showToast({
        type: 'success',
        message: '取消公布成功'
      })
      emit('unpublish')
    })
    .catch((e) => {
      console.error(e)
      showToast({
        type: 'fail',
        message: '取消公布失败'
      })
    })
}

const onDelete = (): void => {
  if (!props.allowDelete) {
    return
  }

  showConfirmDialog({
    title: '注意',
    message: '确定要删除这则反馈吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    axios.delete(`questions/${props.question.id}`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        emit('delete')
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
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
    <div
      v-if="showUser && question.user"
      class="flex items-center px-4 py-3 gap-3 border-b border-gray-200 dark:border-neutral-800"
    >
      <van-image
        class="w-10 h-10"
        round
        fit="fill"
        :src="avatarPlaceholder"
      />
      <div class="flex flex-col gap-1">
        <span
          class="text-sm text-gray-600 dark:text-neutral-300"
          v-text="question.user.name || '匿名用户'"
        />
        <span
          class="text-xs text-gray-500 dark:text-neutral-400"
          v-text="question.user.uid"
        />
      </div>
    </div>
    <div
      class="flex flex-col items-stretch p-4"
      :class="{ 'gap-4': fullContent, 'gap-2': !fullContent }"
    >
      <p
        class="text-sm text-gray-600 dark:text-neutral-300"
        :class="{ 'whitespace-pre-wrap': fullContent }"
        v-text="content"
      />
      <attachment-show
        v-if="fullContent"
        :attachments="question.attachments"
      />
      <p
        v-else-if="question.attachments.length"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        以及 {{ question.attachments.length }} 个附件
      </p>
      <p
        v-if="showUser && question.contact"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        联系方式：{{ question.contact }}
      </p>
      <div class="inline-flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
        <span>反馈于{{ relativeTime(question.createdAt) }}</span>
        <span
          v-if="!question.answer"
          :class="{ 'text-red-500': allowAnswer }"
        >未答复</span>
      </div>
    </div>
    <div
      v-if="question.answer"
      class="flex flex-col items-stretch p-4 gap-4 border-t border-gray-200 dark:border-neutral-800"
    >
      <p
        class="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-wrap"
        v-text="question.answer.content"
      />
      <attachment-show :attachments="question.answer.attachments" />

      <div class="inline-flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
        <span>回复于{{ relativeTime(question.answer.updatedAt) }}</span>
        <template v-if="showPublished">
          <span
            v-if="question.published"
            class="text-brand"
          >已公布</span>
          <span v-else>未公布</span>
        </template>
      </div>
    </div>
    <div
      v-if="allowShow || allowPublish || allowDelete"
      class="flex justify-end items-center px-4 py-3 gap-3 border-t border-gray-200 dark:border-neutral-800"
    >
      <van-button
        v-if="allowShow"
        type="primary"
        size="small"
        plain
        @click="onShow"
      >
        查看详情
      </van-button>
      <template v-if="allowPublish">
        <van-button
          v-if="question.published"
          type="danger"
          size="small"
          plain
          icon-prefix="bi"
          icon="x-lg"
          @click="onUnpublish"
        >
          取消公布
        </van-button>
        <van-button
          v-else
          type="success"
          size="small"
          plain
          icon-prefix="bi"
          icon="megaphone"
          @click="onPublish"
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
        @click="onDelete"
      >
        删除
      </van-button>
    </div>
  </div>
</template>
