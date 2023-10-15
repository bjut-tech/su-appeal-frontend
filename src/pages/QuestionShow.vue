<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import AttachmentShow from '../components/AttachmentShow.vue'
import type { Question } from '../types/Question'

import avatarPlaceholder from '../assets/images/avatar-placeholder.png?url'

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
    class="flex flex-col items-stretch pb-6"
  >
    <van-cell-group
      class="flex flex-col p-4 gap-2"
      title="反馈内容"
      inset
    >
      <div
        class="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-wrap"
        v-text="question.content"
      />
      <attachment-show :attachments="question.attachments" />
    </van-cell-group>
    <van-cell-group
      v-if="question.user"
      title="提交者"
      inset
    >
      <van-cell
        :title="question.user.name || '匿名用户'"
        :label="question.user.uid"
        center
      >
        <template #icon>
          <van-image
            class="w-12 h-12 mr-3"
            round
            fit="fill"
            :src="avatarPlaceholder"
          />
        </template>
      </van-cell>
      <van-cell
        icon-prefix="bi"
        icon="telephone"
        title="联系方式"
        :value="question.contact"
        center
      />
    </van-cell-group>
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
