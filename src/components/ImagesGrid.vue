<script setup lang="ts">
import { showImagePreview } from 'vant'

const props = defineProps<{
  images: string[]
}>()

const onPreview = (index?: number): void => {
  showImagePreview({
    images: props.images,
    startPosition: index ?? 0
  })
}
</script>

<template>
  <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
    <van-image
      v-for="(url, i) in images"
      :key="i"
      class="aspect-square cursor-pointer"
      :src="url"
      block
      fit="cover"
      radius="0.5rem"
      lazy-load
      @click="onPreview(i)"
    />
  </div>
</template>
