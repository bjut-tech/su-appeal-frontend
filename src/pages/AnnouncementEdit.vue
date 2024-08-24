<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast, showConfirmDialog } from 'vant'
import type { AxiosError } from 'axios'

import { useAxiosInstance } from '../lib/axios.ts'
import { useCallbackStore } from '../lib/store.ts'
import AttachmentUpload from '../components/AttachmentUpload.vue'
import type { Announcement, AnnouncementCategory } from '../types/announcement.ts'
import type { Attachment } from '../types/attachment.ts'

interface Form {
  title: string
  category: number | null
  content: string
  attachments: Attachment[]
}

const route = useRoute()

const router = useRouter()

const callbackStore = useCallbackStore()

const announcementId = computed<number | null>(() => {
  return route.params.id ? parseInt(route.params.id as string) : null
})

const isNew = computed<boolean>(() => {
  return route.path.includes('create')
})

const initialForm: Form = {
  title: '',
  category: null,
  content: '',
  attachments: []
}

const draft = useLocalStorage<Form | null>('draft_announcement', initialForm, {
  listenToStorageChanges: false
})

const form = ref<Form>(initialForm)
const errors = ref<Record<string, string>>({})

const {
  isLoading,
  execute
} = useAxios<Announcement>('', {
  method: 'POST'
}, useAxiosInstance(), {
  immediate: false
})

const saveDraft = (): void => {
  if (Object.values(form.value).find((v) => {
    if (Array.isArray(v)) {
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
    message: '确定要提交吗？'
  }).then(() => {
    const url = isNew.value
      ? 'announcements'
      : `announcements/${announcementId.value}`
    execute(url, {
      method: isNew.value ? 'POST' : 'PATCH',
      data: {
        title: form.value.title,
        category: form.value.category,
        content: form.value.content,
        attachmentIds: form.value.attachments.map((attachment) => attachment.id)
      }
    }).then(({ data }) => {
      form.value = initialForm
      if (isNew.value) {
        draft.value = initialForm
      }
      showToast({
        type: 'success',
        message: (isNew.value ? '发布' : '编辑') + '成功',
        mask: true
      })
      if (data.value) {
        router.replace('/announcements')
      }
    }).catch((e: AxiosError) => {
      showToast({
        type: 'fail',
        message: (isNew.value ? '发布' : '保存') + '失败'
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

const onChooseCategory = (): void => {
  router.push('/announcements/categories?choose=true')
}

watch(() => {
  return form.value.category
}, (v) => {
  if (!v) {
    return
  }

  categoryName.value = `加载中... (${v})`
  useAxiosInstance()
    .get<AnnouncementCategory>(`announcements/categories/${v}`)
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
  if (isNew.value) {
    if (draft.value) {
      form.value = draft.value
    }
  } else {
    useAxiosInstance()
      .get<Announcement>(`announcements/${announcementId.value}`)
      .then(({ data }) => {
        form.value = {
          title: data.title,
          category: data.category?.id ?? null,
          content: data.content,
          attachments: data.attachments
        }
      })
      .catch(() => {
        showToast({
          type: 'fail',
          message: '加载失败'
        })
      })
  }

  if (callbackStore.hasSelectedCategory) {
    form.value.category = callbackStore.selectedCategory
    callbackStore.selectedCategory = null
    callbackStore.hasSelectedCategory = false
  }
})

const onLeave = () => {
  if (isNew.value) {
    saveDraft()
  }
}

const isRouteLeave = ref(false)

onBeforeRouteLeave(() => {
  isRouteLeave.value = true
  onLeave()
})

onBeforeUnmount(() => {
  if (!isRouteLeave.value) {
    onLeave()
  }
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
        :error="!!errors.title"
        :error-message="errors.title"
      />
      <van-field
        type="text"
        label="类别"
        placeholder="无类别"
        readonly
        :model-value="categoryName"
        is-link
        :error="!!errors.category"
        :error-message="errors.category"
        @click="onChooseCategory"
      />
      <van-field
        v-model="form.content"
        type="textarea"
        placeholder="请输入正文"
        rows="10"
        maxlength="20000"
        autosize
        show-word-limit
        autocomplete="off"
        :error-message="errors.content"
      />
    </van-cell-group>
    <attachment-upload v-model="form.attachments" />
    <div class="flex justify-evenly items-stretch mt-4 px-4 gap-4">
      <van-button
        v-if="isNew"
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
        :icon="isNew ? 'send' : 'floppy'"
        :loading="isLoading"
        loading-text="加载中..."
        @click="submit"
      >
        {{ isNew ? '发布' : '保存' }}
      </van-button>
    </div>
  </div>
</template>
