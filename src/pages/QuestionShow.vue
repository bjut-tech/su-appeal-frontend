<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Question } from '../types/Question'

const route = useRoute()

const router = useRouter()

const store = useStore()

const axios = useAxiosInstance()

const question = ref<Question | null>(null)

const fetchData = (): void => {
  question.value = null

  axios.get(`/questions/${route.params.id}`)
    .then(({ data }) => {
      question.value = data
    })
    .catch((e: AxiosError) => {
      console.error(e)
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

const onDelete = (): void => {
  router.replace('/questions')
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
    v-if="question"
    class="flex flex-col items-stretch p-6"
  >
    <question-show-component
      :question="question"
      :show-user="store.isAdmin"
      :show-published="store.isAdmin"
      full-content
      :allow-publish="store.isAdmin && !!question.answer"
      :allow-delete="!question.published && (store.isAdmin || question.user?.id === store.user?.id)"
      @publish="fetchData"
      @unpublish="fetchData"
      @delete="onDelete"
    />
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
