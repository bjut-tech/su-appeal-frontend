<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import type { AxiosError } from 'axios'

import AttachmentUpload from './AttachmentUpload.vue'
import type { Attachment } from '../types/attachment.ts'
import type { Question } from '../types/question.ts'
import { useAxiosInstance } from '../lib/axios.ts'

interface AnswerForm {
  content: string
  attachments: Attachment[]
}

const props = defineProps<{
  question: Question
}>()

const emit = defineEmits([
  'delete',
  'update'
])

const form = ref<AnswerForm>({
  content: '',
  attachments: []
})

watch(() => props.question.id, () => {
  if (props.question.answer) {
    form.value.content = props.question.answer.content
    form.value.attachments = props.question.answer.attachments
  } else {
    form.value.content = ''
    form.value.attachments = []
  }
}, {
  immediate: true
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const submit = (): void => {
  errors.value = {}
  isSubmitting.value = true
  useAxiosInstance().post(`questions/${props.question.id}/answer`, {
    content: form.value.content,
    attachmentIds: form.value.attachments.map((attachment) => attachment.id)
  }).then(() => {
    emit('update')
    showToast({
      type: 'success',
      message: '回复成功'
    })
  }).catch((e: AxiosError) => {
    showToast({
      type: 'fail',
      message: '回复失败'
    })
    if (e?.response?.status === 422) {
      errors.value = e?.response?.data as Record<string, string>
    } else {
      console.error(e)
    }
  }).finally(() => (isSubmitting.value = false))
}
</script>

<template>
  <van-cell-group
    title="回复"
    inset
  >
    <van-field
      v-model="form.content"
      type="textarea"
      placeholder="请填写要回复的内容，也可以在下方上传图片和附件。"
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
      v-if="question.answer"
      type="danger"
      block
      icon-prefix="bi"
      icon="trash3"
      @click="emit('delete')"
    >
      删除回复
    </van-button>
    <van-button
      type="primary"
      block
      icon-prefix="bi"
      icon="send"
      :loading="isSubmitting"
      loading-text="加载中..."
      @click="submit"
    >
      提交回复
    </van-button>
  </div>
</template>
