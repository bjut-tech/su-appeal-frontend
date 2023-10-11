<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast, showConfirmDialog } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios'
import AttachmentUpload from '../components/AttachmentUpload.vue'
import type { AnnouncementShow } from '../types/Announcement'
import type { Attachment } from '../types/Attachment'

interface Form {
  title: string
  content: string
  attachments: Attachment[]
}

const router = useRouter()

const initialForm: Form = {
  title: '',
  content: '',
  attachments: []
}

const draft = useLocalStorage<Form | null>('draft_announcement', initialForm, {
  listenToStorageChanges: false
})

const form = ref<Form>(initialForm)
const errors = ref<Record<string, string>>({
  title: '',
  content: ''
})

const {
  isLoading,
  execute
} = useAxios<AnnouncementShow>('announcements', {
  method: 'POST'
}, useAxiosInstance(), {
  immediate: false
})

const saveDraft = (): void => {
  if (Object.values(form.value).find((v) => {
    if (typeof v === 'object') {
      return v.length
    } else {
      return !!v
    }
  })) {
    draft.value = form.value
    showToast('草稿已保存')
  } else {
    draft.value = initialForm
  }
}

const submit = (): void => {
  errors.value = {}
  showConfirmDialog({
    title: '注意',
    message: '确定要发布吗？'
  }).then(() => {
    execute({
      data: {
        title: form.value.title,
        content: form.value.content,
        attachmentIds: form.value.attachments.map((attachment) => attachment.id)
      }
    }).then(({ data }) => {
      draft.value = form.value = initialForm
      showToast({
        type: 'success',
        message: '发布成功',
        mask: true,
        onClose: () => {
          if (data.value) {
            router.replace('/announcements')
          }
        }
      })
    }).catch((e: AxiosError) => {
      showToast({
        type: 'fail',
        message: '发布失败'
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
})

onBeforeUnmount(() => {
  saveDraft()
})
</script>

<template>
  <div class="flex flex-col items-stretch py-6">
    <van-cell-group inset>
      <van-field
        v-model="form.title"
        type="text"
        label="标题"
        placeholder="请输入标题"
        value-class="text-semibold"
        maxlength="85"
        autocomplete="off"
        :error-message="errors.title"
      />
      <van-field
        v-model="form.content"
        type="textarea"
        placeholder="请输入正文"
        rows="10"
        maxlength="20000"
        autocomplete="off"
        :error-message="errors.content"
      />
    </van-cell-group>
    <attachment-upload v-model="form.attachments" />
    <div class="flex mt-4 px-4 gap-4">
      <van-button
        class="flex-1 dark:border-neutral-800"
        type="default"
        block
        icon-prefix="bi"
        icon="floppy"
        @click="saveDraft"
      >
        保存草稿
      </van-button>
      <van-button
        class="flex-1"
        type="primary"
        block
        icon-prefix="bi"
        icon="send"
        :loading="isLoading"
        loading-text="加载中..."
        @click="submit"
      >
        发布
      </van-button>
    </div>
  </div>
</template>
