<script setup lang="ts">
import { onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios.ts'
import AnnouncementShowComponent from '../components/AnnouncementShow.vue'
import BlockLoading from '../components/BlockLoading.vue'
import type { Announcement } from '../types/announcement.ts'

const route = useRoute()

const {
  data: announcement,
  isLoading,
  execute: fetchData
} = useAxios<Announcement>('', useAxiosInstance(), {
  immediate: false
})

onBeforeRouteUpdate((to, from) => {
  if (to.params.id === from.params.id) {
    return
  }

  fetchData(`announcements/${to.params.id}`)
})

onMounted(() => {
  fetchData(`announcements/${route.params.id}`)
})
</script>

<template>
  <div class="flex flex-col items-stretch px-4 py-6 gap-4">
    <block-loading v-if="isLoading || !announcement" />
    <announcement-show-component
      v-else
      :announcement="announcement"
      show-category
      no-collapse
    />
  </div>
</template>
