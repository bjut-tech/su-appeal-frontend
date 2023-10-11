<script setup lang="ts">
import bjutSuLogo from '../assets/images/bjut-su-logo.svg?url'
</script>

<template>
  <div class="flex flex-col items-center gap-8 py-20">
    <div class="flex gap-4 items-stretch">
      <van-image
        class="w-32 h-32"
        round
        fit="fill"
        :src="bjutSuLogo"
      />
    </div>
    <div class="flex flex-col items-center gap-2">
      <h1 class="text-2xl">
        <span class="font-bold">学生权益墙</span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">v1.0.0</span>
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        信息学部学生会学生权益部
      </p>
    </div>
  </div>
</template>
