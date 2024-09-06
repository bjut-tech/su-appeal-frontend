<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'
import BlockLoading from '../components/BlockLoading.vue'
import QuestionAnswerEdit from '../components/QuestionAnswerEdit.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Question } from '../types/question.ts'

const route = useRoute()

const router = useRouter()

const store = useStore()

const loading = ref(false)
const question = ref<Question | null>(null)
const liked = ref(false)

const fetchData = (): void => {
  loading.value = true
  question.value = null

  useAxiosInstance().get<Question>(`questions/${route.params.id}`)
    .then(({ data }) => {
      question.value = data
      if (store.loggedIn) {
        useAxiosInstance().get<number[]>('questions/liked-answers')
          .then(({ data: data1 }) => {
            liked.value = data1.includes(data.answer?.id ?? -1)
          })
          .catch(console.error)
          .finally(() => (loading.value = false))
      } else {
        loading.value = false
      }
    })
    .catch((e: AxiosError) => {
      console.error(e)
      loading.value = false
      if (e?.response?.status && e.response.status >= 400) {
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
  if (!store.loggedIn) {
    return
  }
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

const onDeleteAnswer = (): void => {
  if (!question.value) {
    return
  }

  showConfirmDialog({
    title: '注意',
    message: '确定要删除回复吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance().delete(`questions/${question.value?.id}/answer`)
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

onBeforeRouteUpdate((to, from) => {
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
      <question-answer-edit
        :question="question"
        @delete="onDeleteAnswer"
      />
    </template>
  </div>
  <block-loading v-else />
</template>
