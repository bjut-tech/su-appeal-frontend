<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast, showConfirmDialog } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios.ts'
import { getCampusName } from '../lib/campus.ts'
import { useStore } from '../lib/store.ts'
import AttachmentUpload from '../components/AttachmentUpload.vue'
import CampusSelect from '../components/CampusSelect.vue'
import QuestionCategorySelect from '../components/QuestionCategorySelect.vue'
import type { Attachment } from '../types/attachment.ts'
import type { ResourceTokenResponse } from '../types/misc.ts'
import type { Question, QuestionCategory } from '../types/question.ts'

interface Form {
  contact: string
  campus: string
  category: number | null
  content: string
  attachments: Attachment[]
}

const store = useStore()

const router = useRouter()

const uid = ref<string>('')
const name = ref<string>('')

const initialForm = (): Form => ({
  contact: '',
  campus: '',
  category: null,
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
} = useAxios<ResourceTokenResponse<Question>>('questions', {
  method: 'POST'
}, useAxiosInstance(), {
  immediate: false
})

const saveDraft = (): void => {
  if (form.value.content.length || form.value.attachments.length) {
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
        uid: store.user?.uid ?? uid.value,
        name: store.user?.name ?? name.value,
        category: form.value.category,
        contact: form.value.contact,
        campus: form.value.campus,
        content: form.value.content,
        attachmentIds: form.value.attachments.map((attachment) => attachment.id)
      }
    }).then(({ data }) => {
      draft.value = form.value = initialForm()
      if (data.value?.resource_token) {
        store.tokenSecondary = data.value.resource_token.access_token
        store.tokenSecondaryExpiry = Date.now() + data.value.resource_token.expires_in * 1000
      }
      router.replace(`/questions/create/success?id=${data.value?.data?.id}`)
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

const categoryName = ref('')

watch(() => form.value.category, (v) => {
  if (!v) {
    categoryName.value = ''
    return
  }

  categoryName.value = `加载中... (#${v})`
  useAxiosInstance()
    .get<QuestionCategory>(`questions/categories/${v}`)
    .then(({ data }) => {
      categoryName.value = data.name
    })
    .catch(() => {
      // possibly that the category has been deleted, so just fail silently
      form.value.category = null
      categoryName.value = ''
    })
}, {
  immediate: true
})

onMounted(() => {
  if (draft.value) {
    form.value = draft.value
  }

  if (store.user) {
    uid.value = store.user.uid
    name.value = store.user.name ?? ''
  }
})

onBeforeUnmount(() => {
  saveDraft()
})
</script>

<template>
  <div class="flex flex-col items-stretch pb-6">
    <van-cell-group inset>
      <template #title>
        <span>个人信息（非必填）</span>
        <p
          v-if="!store.loggedIn"
          class="text-xs mt-1"
        >
          若不填，则无法查看已提交的反馈内容
        </p>
        <p
          v-else
          class="text-xs mt-1"
        >
          若要匿名反馈，请先退出登录
        </p>
      </template>
      <van-field
        v-model="uid"
        type="text"
        label="学号"
        placeholder="匿名用户"
        maxlength="32"
        :disabled="store.loggedIn"
        :error="!!errors.uid"
        :error-message="errors.uid"
        autocomplete="username"
      />
      <van-field
        v-model="name"
        type="text"
        label="姓名"
        placeholder="匿名用户"
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
        placeholder="手机号或微信号等"
        maxlength="85"
        :error="!!errors.contact"
        :error-message="errors.contact"
        autocomplete="tel"
      />
    </van-cell-group>
    <van-cell-group
      title="反馈内容"
      inset
    >
      <campus-select
        v-slot="{ trigger }"
        v-model="form.campus"
      >
        <van-field
          label="所在校区"
          placeholder="请选择所在校区"
          :model-value="getCampusName(form.campus)"
          is-link
          readonly
          :error="!!errors.campus"
          :error-message="errors.campus"
          @click="trigger()"
        />
      </campus-select>
      <question-category-select
        v-slot="{ trigger }"
        v-model="form.category"
      >
        <van-field
          type="text"
          label="反馈分类"
          placeholder="请选择类别"
          readonly
          :model-value="categoryName"
          is-link
          :error="!!errors.category"
          :error-message="errors.category"
          @click="trigger()"
        />
      </question-category-select>
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
