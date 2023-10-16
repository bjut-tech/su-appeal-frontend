<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast, showConfirmDialog } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import type { Attachment } from '../types/Attachment'
import type { Question } from '../types/Question'
import AttachmentUpload from '../components/AttachmentUpload.vue'

interface Form {
  uid: string
  name: string
  contact: string
  content: string
  attachments: Attachment[]
}

const store = useStore()

const router = useRouter()

const initialForm = (): Form => ({
  uid: '',
  name: '',
  contact: '',
  content: '',
  attachments: []
})

const draft = useLocalStorage<Form | null>('draft_question', initialForm(), {
  listenToStorageChanges: false
})

const form = ref<Form>(initialForm())
const errors = ref<Record<string, string>>({})

const {
  isLoading,
  execute
} = useAxios<Question>('questions', {
  method: 'POST'
}, useAxiosInstance(), {
  immediate: false
})

const saveDraft = (): void => {
  if (form.value.content.length) {
    draft.value = form.value
    showToast('草稿已保存')
  } else {
    draft.value = initialForm()
  }
}

const submit = (): void => {
  errors.value = {}
  showConfirmDialog({
    title: '注意',
    message: '确定要提交吗？'
  }).then(() => {
    execute({
      data: {
        uid: store.user?.uid ?? form.value.uid,
        name: store.user?.name ?? form.value.name,
        contact: form.value.contact,
        content: form.value.content,
        attachmentIds: form.value.attachments.map((attachment) => attachment.id)
      }
    }).then(({ data }) => {
      draft.value = form.value = initialForm()
      router.replace(`/questions/create/success?id=${data.value?.id}`)
    }).catch((e: AxiosError) => {
      showToast({
        type: 'fail',
        message: '提交失败'
      })
      if (e?.response?.status === 422) {
        errors.value = e?.response?.data as Record<string, string>
      } else {
        console.error(e)
      }
    })
  })
}

onMounted(() => {
  if (draft.value) {
    form.value = draft.value
  }

  if (store.user) {
    form.value.uid = store.user.uid
    form.value.name = store.user.name ?? ''
  }
})

onBeforeUnmount(() => {
  saveDraft()
})
</script>

<template>
  <div class="flex flex-col items-stretch pb-6">
    <van-cell-group
      title="个人信息"
      inset
    >
      <van-field
        v-model="form.uid"
        type="text"
        label="学号"
        placeholder="请输入学号"
        maxlength="32"
        :disabled="store.loggedIn"
        :error="!!errors.uid"
        :error-message="errors.uid"
        autocomplete="username"
      />
      <van-field
        v-model="form.name"
        type="text"
        label="姓名"
        placeholder="请输入姓名"
        maxlength="85"
        :disabled="store.loggedIn"
        :error="!!errors.name"
        :error-message="errors.name"
        autocomplete="name"
      />
      <van-field
        v-model="form.contact"
        type="text"
        label="联系方式"
        placeholder="请输入联系方式（手机号或微信号等）"
        maxlength="85"
        :error="!!errors.contact"
        :error-message="errors.contact"
        autocomplete="tel"
      />
    </van-cell-group>
    <van-cell-group
      title="正文"
      inset
    >
      <van-field
        v-model="form.content"
        type="textarea"
        placeholder="请在此详细描述你要反馈的内容，也可以在下方添加图片。"
        rows="10"
        autosize
        show-word-limit
        maxlength="20000"
        autocomplete="off"
        :error-message="errors.content"
      />
    </van-cell-group>
    <attachment-upload v-model="form.attachments" />
    <div class="flex justify-evenly items-stretch mt-4 px-4 gap-4">
      <van-button
        class="dark:border-neutral-800"
        type="default"
        block
        icon-prefix="bi"
        icon="floppy"
        @click="saveDraft"
      >
        保存草稿
      </van-button>
      <van-button
        type="primary"
        block
        icon-prefix="bi"
        icon="send"
        :loading="isLoading"
        loading-text="加载中..."
        @click="submit"
      >
        提交反馈
      </van-button>
    </div>
  </div>
</template>
