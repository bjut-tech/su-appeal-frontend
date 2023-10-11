<script setup lang="ts">
import { getUrl } from '../utils/attachment'
import filesize from '../utils/filesize'
import type { Attachment } from '../types/Attachment'

const props = defineProps<{
  attachments: Attachment[]
}>()

const onDownload = (attachment: Attachment): void => {
  location.href = getUrl(attachment)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="attachment in props.attachments"
      :key="attachment.id"
      class="flex items-center py-2 px-3 gap-3 -mx-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer select-none"
      @click="onDownload(attachment)"
    >
      <div class="flex-shrink-0 flex justify-center items-center text-xl">
        <i class="bi bi-file-earmark-text" />
      </div>
      <div class="flex-1 flex flex-col gap-0.5">
        <h5
          class="text-sm text-gray-600 dark:text-neutral-300"
          v-text="attachment.name"
        />
        <span
          class="text-xs text-gray-500 dark:text-neutral-400"
          v-text="filesize(attachment.size)"
        />
      </div>
    </div>
  </div>
</template>
