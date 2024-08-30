<script setup lang="ts">
import { getUrl } from '../utils/attachment.ts'
import type { AnnouncementCarousel } from '../types/announcement.ts'

defineProps<{
  value: AnnouncementCarousel
}>()
</script>

<template>
  <div
    class="w-full aspect-[32/9] relative p-4 text-white shadow-sm cursor-pointer select-none"
    :class="{ 'bg-brand/80': !value.cover, 'bg-cover bg-center': value.cover }"
    :style="{ backgroundImage: value.cover ? `url(${getUrl(value.cover)})` : '' }"
  >
    <div
      v-if="!value.cover"
      class="w-full h-full flex flex-col justify-center items-center overflow-hidden"
    >
      <h5
        class="text-center text-white-outlined text-xl sm:text-2xl font-semibold"
        v-text="value.announcement.title"
      />
    </div>
  </div>
</template>

<style scoped>
.text-white-outlined {
  color: #f3f4f6;
  text-shadow: 0 0 0.1em #111827;
}
</style>
