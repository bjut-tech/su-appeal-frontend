<script setup lang="ts">
import { computed, ref } from 'vue'

import truncate from '../utils/truncate.ts'

const props = defineProps<{
  text: string
  limit?: number
}>()

const limit = computed(() => props.limit ?? 150)

const isTruncated = computed(() => {
  return props.text.length > limit.value
})

const isCollapse = ref(true)
</script>

<template>
  <p
    class="whitespace-pre-wrap"
    v-bind="$attrs"
    v-text="isCollapse ? truncate(text, limit) : text"
  />
  <a
    v-if="isTruncated"
    class="text-xs text-brand cursor-pointer select-none"
    @click="isCollapse = !isCollapse"
  >
    <i
      class="bi"
      :class="{ 'bi-caret-down-fill': isCollapse, 'bi-caret-up-fill': !isCollapse }"
    />
    {{ isCollapse ? '展开' : '收起' }}
  </a>
</template>
