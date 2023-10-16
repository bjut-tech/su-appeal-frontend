<script setup lang="ts">
import { computed } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios'

import bjutSuLogo from '../assets/images/bjut-su-logo.svg?url'

interface ActuatorInfo {
  build?: {
    artifact: string
    name: string
    time: string
    version: string
    group: string
  }
}

const { data } = useAxios<ActuatorInfo>('actuator/info', useAxiosInstance(), {
  immediate: true
})

const version = computed(() => {
  if (data.value?.build?.version) {
    return 'v' + data.value.build.version
  }

  return ''
})
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
        <span
          v-if="version"
          class="ml-2 text-sm text-gray-500 dark:text-neutral-400"
          v-text="version"
        />
      </h1>
      <p class="text-gray-500 dark:text-neutral-400">
        信息学部学生会学生权益部
      </p>
    </div>
  </div>
</template>
