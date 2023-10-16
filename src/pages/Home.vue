<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  router.push('/announcements')
})
</script>

<template>
  <!-- Empty component for redirection -->
  <div />
</template>
