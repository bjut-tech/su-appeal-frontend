<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ActionSheetAction } from 'vant'

import { campusOptions } from '../lib/campus.ts'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits([
  'update:modelValue'
])

const actions = computed<ActionSheetAction[]>(() => {
  return campusOptions.map((campus) => ({
    name: campus.text,
    callback: () => {
      emit('update:modelValue', campus.value)
    }
  }))
})

const isShow = ref(false)

const show = (): void => {
  isShow.value = true
}
</script>

<template>
  <slot :trigger="show" />
  <van-action-sheet
    v-model:show="isShow"
    teleport="body"
    :closeable="false"
    title="选择校区"
    cancel-text="取消"
    :actions="actions"
    close-on-click-action
    safe-area-inset-bottom
  />
</template>
