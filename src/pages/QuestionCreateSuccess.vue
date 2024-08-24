<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useStore } from '../lib/store.ts'

const route = useRoute()

const store = useStore()

const viewUrl = computed(() => {
  if (route.query.id) {
    return `/questions/${route.query.id}`
  } else {
    return '/user/history'
  }
})
</script>

<template>
  <div class="flex flex-col items-center px-12 py-24">
    <h2 class="inline-flex justify-center gap-4 text-3xl font-bold text-green-600">
      <i class="bi bi-send-check" />
      提交成功！
    </h2>
    <p
      v-if="!store.loggedIn"
      class="mt-8 text-sm text-gray-500 dark:text-gray-400"
    >
      若正确填写了学号，可以登录后查看已提交的反馈内容
    </p>
    <div class="max-w-[12rem] w-full mt-16 flex flex-col items-stretch gap-4">
      <van-button
        class="dark:border-neutral-800"
        type="default"
        block
        icon-prefix="bi"
        icon="house-door"
        to="/"
      >
        返回首页
      </van-button>
      <van-button
        type="primary"
        block
        icon-prefix="bi"
        icon="clock-history"
        :to="viewUrl"
      >
        查看反馈
      </van-button>
    </div>
  </div>
</template>
