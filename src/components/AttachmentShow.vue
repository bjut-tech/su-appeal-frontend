<script setup lang="ts">
import { computed } from 'vue'
import { showImagePreview } from 'vant'

import { getUrl, getThumbnailUrl } from '../utils/attachment.ts'
import filesize from '../utils/filesize.ts'
import { isImage } from '../utils/filetype.ts'
import type { Attachment } from '../types/attachment.ts'

const props = defineProps<{
  attachments: Attachment[]
}>()

const images = computed<Array<{
  url: string
  thumbnailUrl: string
}>>(() => {
  return props.attachments.filter((attachment) => {
    return isImage(attachment.name)
  }).map((attachment) => ({
    url: getUrl(attachment),
    thumbnailUrl: getThumbnailUrl(attachment)
  }))
})

const files = computed<Attachment[]>(() => {
  return props.attachments.filter((attachment) => {
    return !isImage(attachment.name)
  })
})

const onPreview = (index?: number): void => {
  showImagePreview({
    images: images.value.map((image) => image.url),
    startPosition: index ?? 0,
    loop: false,
    doubleScale: false
  })
}

const onDownload = (attachment: Attachment): void => {
  location.href = getUrl(attachment)
}
</script>

<template>
  <div
    v-if="images.length"
    class="grid grid-cols-3 sm:grid-cols-4 gap-2"
  >
    <van-image
      v-for="(image, i) in images"
      :key="i"
      class="aspect-square cursor-pointer"
      :src="image.thumbnailUrl"
      block
      fit="cover"
      radius="0.5rem"
      lazy-load
      @click="onPreview(i)"
    />
  </div>
  <div
    v-if="files.length"
    class="flex flex-col gap-2"
  >
    <div
      v-for="item of files"
      :key="item.id"
      class="flex items-center py-2 px-4 gap-3 -mx-4 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer select-none"
      @click="onDownload(item)"
    >
      <div class="flex-shrink-0 flex justify-center items-center text-xl">
        <i class="bi bi-file-earmark-text" />
      </div>
      <div class="flex-1 flex flex-col gap-0.5">
        <h5
          class="text-sm text-gray-600 dark:text-neutral-300"
          v-text="item.name"
        />
        <span
          class="text-xs text-gray-500 dark:text-neutral-400"
          v-text="filesize(item.size)"
        />
      </div>
    </div>
  </div>
</template>
