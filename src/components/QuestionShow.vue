<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showDialog, showToast } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios.ts'
import { getCampusName } from '../lib/campus.ts'
import { useStore } from '../lib/store.ts'
import { formatTime } from '../utils/datetime.ts'
import truncate from '../utils/truncate.ts'
import AttachmentShow from './AttachmentShow.vue'
import CollapseParagraph from './CollapseParagraph.vue'
import type { Question } from '../types/question.ts'

import avatarPlaceholder from '../assets/images/avatar-placeholder.png?url'

const props = defineProps<{
  question: Question
  answerLiked?: boolean
  showUser?: boolean
  showPublished?: boolean
  hideCampus?: boolean
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
  'unpublish',
  'like',
  'unlike'
])

const store = useStore()

const router = useRouter()

const showLike = computed(() => {
  return props.question.answer && props.question.published
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
    useAxiosInstance()
      .post(`questions/${props.question.id}/publish`)
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

  useAxiosInstance()
    .delete(`questions/${props.question.id}/publish`)
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
    useAxiosInstance()
      .delete(`questions/${props.question.id}`)
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

const onLikeAnswer = (): void => {
  if (props.answerLiked) {
    if (!store.loggedIn) {
      return
    }

    useAxiosInstance()
      .delete(`questions/${props.question.id}/answer/like`)
      .then(() => {
        emit('unlike')
      })
      .catch((e) => {
        console.error(e)
        showToast({
          type: 'fail',
          message: '操作失败'
        })
      })
  } else {
    useAxiosInstance()
      .post(`questions/${props.question.id}/answer/like`)
      .then(() => {
        emit('like')
      })
      .catch((e: AxiosError) => {
        if (e?.response?.status === 429 && !store.loggedIn) {
          showDialog({
            title: '注意',
            message: '匿名用户不能频繁点赞，请登录后再试'
          })
          return
        }

        console.error(e)
        showToast({
          type: 'fail',
          message: '操作失败'
        })
      })
  }
}
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
    <div
      v-if="showUser"
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
          v-text="question.user?.name || '匿名用户'"
        />
        <span
          v-if="question.user"
          class="text-xs text-gray-500 dark:text-neutral-400"
          v-text="question.user.uid"
        />
      </div>
    </div>
    <div
      class="flex flex-col items-stretch p-4"
      :class="{ 'gap-4': fullContent, 'gap-2': !fullContent }"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex-shrink-0 w-1 rounded bg-brand"
          :class="question.category ? 'h-10' : 'h-5'"
        />
        <div
          v-if="question.category"
          class="flex-1 flex flex-col gap-0.5"
        >
          <div class="flex justify-end items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            <span
              class="flex-1 text-brand font-bold"
              v-text="question.category.name"
            />
            <div class="flex-shrink-0 inline-flex flex-row-reverse items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
              <span v-text="formatTime(question.createdAt)" />
              <span
                v-if="!question.answer"
                :class="{ 'text-red-500': allowAnswer }"
              >未答复</span>
            </div>
          </div>
          <h5 class="font-semibold">
            反馈
          </h5>
        </div>
        <template v-else>
          <h5 class="flex-1 font-semibold">
            反馈
          </h5>
          <div class="flex-shrink-0 inline-flex flex-row-reverse items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
            <span v-text="formatTime(question.createdAt)" />
            <span
              v-if="!question.answer"
              :class="{ 'text-red-500': allowAnswer }"
            >未答复</span>
          </div>
        </template>
      </div>
      <collapse-paragraph
        v-if="fullContent"
        class="text-sm text-gray-600 dark:text-neutral-300"
        :text="question.content.trim()"
        :limit="1000"
      />
      <p
        v-else
        class="text-sm text-gray-600 dark:text-neutral-300"
        :class="{ 'whitespace-pre-wrap': fullContent }"
        v-text="truncate(question.content.trim())"
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
        v-if="!hideCampus && question.campus"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        所在校区：{{ getCampusName(question.campus) }}
      </p>
      <p
        v-if="showUser && question.contact"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        联系方式：{{ question.contact.trim() }}
      </p>
    </div>
    <div
      v-if="question.answer"
      class="flex flex-col items-stretch p-4 border-t border-gray-200 dark:border-neutral-800"
      :class="{ 'gap-4': fullContent, 'gap-2': !fullContent }"
    >
      <div class="flex items-center gap-2">
        <div class="flex-shrink-0 w-1 h-5 rounded bg-brand" />
        <h5 class="flex-1 font-semibold">
          答复
        </h5>
        <div class="flex-shrink-0 inline-flex flex-row-reverse items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
          <span v-text="formatTime(question.answer.updatedAt)" />
          <template v-if="showPublished">
            <span
              v-if="question.published"
              class="text-brand"
            >已公布</span>
            <span v-else>未公布</span>
          </template>
        </div>
      </div>
      <collapse-paragraph
        v-if="fullContent"
        class="text-sm text-gray-600 dark:text-neutral-300"
        :text="question.answer.content.trim()"
        :limit="1000"
      />
      <p
        v-else
        class="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-wrap"
        v-text="truncate(question.answer.content.trim())"
      />
      <attachment-show
        v-if="fullContent"
        :attachments="question.answer.attachments"
      />
      <p
        v-else-if="question.answer.attachments.length"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        以及 {{ question.answer.attachments.length }} 个附件
      </p>
      <p
        v-if="question.answer.user"
        class="text-xs text-gray-500 dark:text-neutral-400"
      >
        回复者：{{ question.answer.user.name ?? question.answer.user.uid }}
      </p>
    </div>
    <div
      v-if="showLike || allowShow || allowPublish || allowDelete"
      class="flex justify-end items-center px-4 py-3 gap-3 border-t border-gray-200 dark:border-neutral-800"
    >
      <van-button
        v-if="allowShow"
        type="primary"
        size="small"
        plain
        @click="onShow"
      >
        查看详情{{ allowAnswer ? ' / 回复' : '' }}
      </van-button>
      <van-button
        v-if="showLike"
        type="danger"
        size="small"
        plain
        :disabled="answerLiked && !store.loggedIn"
        @click="onLikeAnswer"
      >
        <i
          class="bi"
          :class="{ 'bi-hand-thumbs-up-fill': answerLiked, 'bi-hand-thumbs-up': !answerLiked }"
        />
        {{ question.answer?.likesCount ?? 0 }}
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
