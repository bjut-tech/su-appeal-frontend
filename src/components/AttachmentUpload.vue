<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { UseObjectUrl } from '@vueuse/components'
import type { AxiosError } from 'axios'

import { getUrl } from '../utils/attachment.ts'
import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'
import filesize from '../utils/filesize.ts'
import { isImage } from '../utils/filetype.ts'
import type { Attachment } from '../types/attachment.ts'

interface AttachmentUploading {
  id: string // temp id
  name: string
  size: number
  status: 'pending' | 'uploading' | 'error'
  error?: string
  progress: number
  rawFile: File
  cancel?: () => void
}

interface AttachmentUploaded extends Attachment {
  status: 'success'
  rawFile?: File
}

type AttachmentUpload = AttachmentUploading | AttachmentUploaded

const store = useStore()

const axios = useAxiosInstance()

const props = withDefaults(defineProps<{
  modelValue: Attachment[]
  title?: string
  allowImage?: boolean
  allowFile?: boolean
  allowMultiple?: boolean
}>(), {
  title: '附件',
  allowImage: true,
  allowFile: true,
  allowMultiple: true
})

const emit = defineEmits([
  'update:modelValue'
])

let nextTempId = 1
const files = ref<AttachmentUpload[]>([])

const stopWatchProp = watch(() => props.modelValue, (value) => {
  if (value.length && !files.value.length) {
    files.value = value.map((file) => {
      return Object.assign({}, file, {
        status: 'success'
      }) as AttachmentUploaded
    })
  }
}, {
  immediate: true
})

watch(() => files.value, (value) => {
  if (value.length) {
    stopWatchProp()
  }

  emit('update:modelValue', value.filter((v) => {
    return v.status === 'success'
  }).map((v) => ({
    id: v.id,
    name: v.name,
    size: v.size
  })))
}, {
  deep: true,
  immediate: true
})

const uploadNext = (): void => {
  if (files.value.findIndex(file => file.status === 'pending') === -1 ||
      files.value.findIndex(file => file.status === 'uploading') !== -1) {
    return
  }

  const file = files.value.find(file => file.status === 'pending') as AttachmentUploading

  const controller = new AbortController()

  updateState(file.id, {
    error: undefined,
    status: 'uploading',
    progress: 0,
    cancel: () => {
      controller.abort()
    }
  })

  const formData = new FormData()
  formData.append('file', file.rawFile)
  formData.append('name', file.name)

  axios.post<string>('attachments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    signal: controller.signal,
    onUploadProgress: (event) => {
      updateState(file.id, {
        status: 'uploading',
        progress: event.loaded / (event.total ?? file.size)
      })
    }
  }).then(({ data }) => {
    updateState(file.id, {
      id: data,
      name: file.name,
      size: file.size,
      status: 'success',
      rawFile: file.rawFile
    })
  }).catch((e: AxiosError) => {
    console.error(e)
    if (e?.response?.status === 429) {
      updateState(file.id, {
        status: 'error',
        error: '上传服务繁忙，请稍后再试'
      })
    } else if (e?.response?.status === 422) {
      updateState(file.id, {
        status: 'error',
        error: '文件格式不正确'
      })
    } else {
      updateState(file.id, {
        status: 'error',
        error: '上传失败'
      })
    }
  }).finally(() => {
    uploadNext()
  })
}

const updateState = (id: string, state: Partial<AttachmentUploading> | AttachmentUploaded): void => {
  const index = files.value.findIndex((file) => file.id === id)

  if (index === -1) {
    return
  }

  const newState: AttachmentUpload = state.status === 'success'
    ? state
    : Object.assign(files.value[index] as AttachmentUploading, state)

  files.value = [
    ...files.value.slice(0, index),
    newState,
    ...files.value.slice(index + 1)
  ]
}

const onUpload = (mime: string = '*'): void => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = mime
  input.multiple = props.allowMultiple && store.isAdmin
  input.onchange = (e) => {
    const newFiles = (e.target as HTMLInputElement).files

    if (!newFiles) {
      return
    }

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]

      if (store.isAdmin) {
        if (file.size > 100000000) {
          showToast('文件大小不能超过 100MB！')
          continue
        }
      } else {
        if (!file.type.startsWith('image/')) {
          showToast('只能上传图片！')
          continue
        }

        if (file.size > 10485760) {
          showToast('图片大小不能超过 10MB！')
          continue
        }
      }

      files.value = [...files.value, {
        id: String(nextTempId++),
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        rawFile: file
      }]
    }

    uploadNext()
  }
  input.click()
}

const onDownload = (index: number): void => {
  const file = files.value[index]

  if (file.status === 'success') {
    location.href = getUrl(file)
  }
}

const onRetry = (index: number): void => {
  const file = files.value[index]

  if (file.status === 'error') {
    updateState(file.id, {
      status: 'pending'
    })
    uploadNext()
  }
}

const onRemove = (index: number): void => {
  const file = files.value[index]

  showConfirmDialog({
    title: '注意',
    message: '确定要移除此文件吗？'
  }).then(() => {
    if (file.status === 'uploading' && file.cancel) {
      file.cancel()
    }

    files.value = [
      ...files.value.slice(0, index),
      ...files.value.slice(index + 1)
    ]
  })
}

onBeforeUnmount(() => {
  files.value.forEach((file) => {
    if (file.status === 'uploading' && file.cancel) {
      file.cancel()
    }
  })
})
</script>

<template>
  <van-cell-group
    :title="title"
    inset
  >
    <div
      v-for="(item, i) in files"
      :key="item.id"
      class="w-full flex items-stretch text-gray-800 dark:text-neutral-200 border-b border-gray-200 last:border-b-0 dark:border-neutral-800"
    >
      <div
        v-if="isImage(item.name)"
        class="relative w-20 flex-none"
      >
        <use-object-url
          v-if="item.rawFile"
          v-slot="url"
          :object="item.rawFile"
        >
          <img
            class="absolute w-full h-full top-0 left-0 object-cover"
            :src="url.value"
            alt="图像预览"
          >
        </use-object-url>
        <img
          v-else
          class="absolute w-full h-full top-0 left-0 object-cover"
          :src="getUrl(item as AttachmentUploaded)"
          alt="图像预览"
        >
      </div>
      <div
        v-else
        class="flex justify-center items-center w-20 text-2xl border-r border-gray-200 dark:border-neutral-800"
      >
        <i class="bi bi-file-earmark-text" />
      </div>
      <div class="flex-1 flex flex-col justify-center items-stretch gap-2 pl-4 py-3 pr-2 overflow-hidden">
        <span
          class="block text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
          v-text="item.name"
        />
        <div class="bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div
            class="bg-brand h-1 rounded-full transition-[width] ease-linear duration-500"
            :style="{ width: ('progress' in item ? (item.progress || 0) * 100 : 100) + '%' }"
          />
        </div>
        <div class="flex justify-between gap-2 text-xs text-gray-500 dark:text-neutral-400">
          <span
            v-if="item.size"
            v-text="filesize(item.size)"
          />
          <span v-if="item.status === 'success'">已上传</span>
          <span v-else-if="item.status === 'pending'">等待上传</span>
          <span v-else-if="item.status === 'uploading'">上传中</span>
          <span
            v-else-if="item.status === 'error'"
            class="text-red-600"
            v-text="item.error || '上传失败'"
          />
        </div>
      </div>
      <div class="flex-shrink-0 flex flex-col justify-center p-2 pl-0 gap-1">
        <button
          class="w-8 h-8 flex justify-center items-center bg-none hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 rounded cursor-pointer select-none"
          title="移除"
          @click="onRemove(i)"
        >
          <i class="bi bi-trash3" />
        </button>
        <button
          v-if="item.status === 'success'"
          class="w-8 h-8 flex justify-center items-center bg-none hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 rounded cursor-pointer select-none"
          title="下载"
          @click="onDownload(i)"
        >
          <i class="bi bi-cloud-download" />
        </button>
        <button
          v-if="item.status === 'error'"
          class="w-8 h-8 flex justify-center items-center bg-none hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 rounded cursor-pointer select-none"
          title="重试"
          @click="onRetry(i)"
        >
          <i class="bi bi-arrow-clockwise" />
        </button>
      </div>
    </div>
    <template v-if="allowMultiple || !files.length">
      <van-cell
        icon="plus"
        title="添加图片"
        label="每张大小不超过 10MB"
        is-link
        @click="onUpload('image/*')"
      />
      <van-cell
        v-if="allowFile && store.isAdmin"
        icon="plus"
        title="添加文件"
        label="每个大小不超过 100MB"
        is-link
        @click="onUpload()"
      />
    </template>
  </van-cell-group>
</template>
