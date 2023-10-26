<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import AttachmentUpload from '../components/AttachmentUpload.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Attachment } from '../types/Attachment'
import type { Question } from '../types/Question'

interface AnswerForm {
  content: string
  attachments: Attachment[]
}

const route = useRoute()

const router = useRouter()

const store = useStore()

const axios = useAxiosInstance()

const loading = ref(false)
const question = ref<Question | null>(null)
const liked = ref(false)

const fetchData = (): void => {
  loading.value = true
  question.value = null

  axios.get<Question>(`questions/${route.params.id}`)
    .then(({ data }) => {
      question.value = data
      answerForm.value = {
        content: data.answer?.content ?? '',
        attachments: data.answer?.attachments ?? []
      }
      axios.get<number[]>('questions/liked-answers')
        .then(({ data: data1 }) => {
          liked.value = data1.includes(data.answer?.id ?? -1)
        })
        .catch(console.error)
        .finally(() => (loading.value = false))
    })
    .catch((e: AxiosError) => {
      console.error(e)
      loading.value = false
      if (e?.response?.status === 404 || e?.response?.status === 401) {
        router.replace('/not-found')
      } else {
        showToast({
          type: 'fail',
          message: '加载失败',
          onClose: () => {
            router.back()
          }
        })
      }
    })
}

const onLike = (): void => {
  if (question.value?.answer) {
    question.value.answer.likesCount++
  }
  liked.value = true
}

const onUnlike = (): void => {
  if (question.value?.answer) {
    question.value.answer.likesCount--
    if (question.value.answer.likesCount < 0) {
      question.value.answer.likesCount = 0
    }
  }
  liked.value = false
}

const onDelete = (): void => {
  router.replace('/questions')
}

const answerForm = ref<AnswerForm>({
  content: '',
  attachments: []
})

const answerErrors = ref<Record<string, string>>({})
const isAnswerSubmitting = ref(false)

const answerSubmit = (): void => {
  if (!question.value) {
    return
  }

  answerErrors.value = {}
  isAnswerSubmitting.value = true
  axios.post(`questions/${question.value.id}/answer`, {
    content: answerForm.value.content,
    attachmentIds: answerForm.value.attachments.map((attachment) => attachment.id)
  }).then(() => {
    showToast({
      type: 'success',
      message: '回复成功'
    })
    fetchData()
  }).catch((e: AxiosError) => {
    showToast({
      type: 'fail',
      message: '回复失败'
    })
    if (e?.response?.status === 422) {
      answerErrors.value = e?.response?.data as Record<string, string>
    } else {
      console.error(e)
    }
  }).finally(() => (isAnswerSubmitting.value = false))
}

const onDeleteAnswer = (): void => {
  if (!question.value) {
    return
  }

  showConfirmDialog({
    title: '注意',
    message: '确定要删除回复吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    axios.delete(`questions/${question.value?.id}/answer`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        fetchData()
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

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id === from.params.id) {
    return
  }

  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div
    v-if="question && !loading"
    class="flex flex-col items-stretch py-6"
  >
    <question-show-component
      class="mx-4"
      :question="question"
      :answer-liked="liked"
      :show-user="store.isAdmin"
      :show-published="store.isAdmin"
      full-content
      :allow-publish="store.isAdmin && !!question.answer"
      :allow-delete="!question.published && (store.isAdmin || question.user?.id === store.user?.id)"
      @publish="fetchData"
      @unpublish="fetchData"
      @like="onLike"
      @unlike="onUnlike"
      @delete="onDelete"
    />

    <template v-if="store.isAdmin">
      <hr class="mx-4 mt-6 mb-2 border-gray-200 dark:border-neutral-800">
      <van-cell-group
        title="回复"
        inset
      >
        <van-field
          v-model="answerForm.content"
          type="textarea"
          placeholder="请填写要回复的内容，也可以在下方上传图片和附件。"
          rows="10"
          autosize
          show-word-limit
          maxlength="20000"
          autocomplete="off"
          :error-message="answerErrors.content"
        />
      </van-cell-group>
      <attachment-upload v-model="answerForm.attachments" />
      <div class="flex justify-evenly items-stretch mt-4 px-4 gap-4">
        <van-button
          v-if="question.answer"
          type="danger"
          block
          icon-prefix="bi"
          icon="trash3"
          @click="onDeleteAnswer"
        >
          删除回复
        </van-button>
        <van-button
          type="primary"
          block
          icon-prefix="bi"
          icon="send"
          :loading="isAnswerSubmitting"
          loading-text="加载中..."
          @click="answerSubmit"
        >
          提交回复
        </van-button>
      </div>
    </template>
  </div>
  <div
    v-else
    class="flex justify-center py-8"
  >
    <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg">
      <van-loading
        size="24px"
        vertical
      >
        加载中...
      </van-loading>
    </div>
  </div>
</template>
