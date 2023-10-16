<script setup lang="ts">
import { ref } from 'vue'

import { useStore } from '../lib/store'
import PaginatedList from '../components/PaginatedList.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Question } from '../types/Question'

defineProps<{
  history?: boolean
}>()

const store = useStore()

const list = ref<Question[]>([])

const onPublish = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id) {
      item.published = true
    }
    return item
  })
}

const onUnpublish = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id) {
      item.published = false
    }
    return item
  })
}

const onDelete = (id: number): void => {
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<template>
  <paginated-list
    v-model="list"
    :url="history ? 'questions/history' : 'questions'"
    custom-class="flex flex-col px-4 py-6 gap-4"
    pull-refresh
  >
    <!--              | history    | published | all (admin)
    --- show          | true       | false     | true
    --- showUser      | false      | admin     | true
    --- showPublished | true       | admin     | true
    --- fullContent   | false      | true      | published
    --- allowDelete   | !published | false     | !published
    --- allowPublish  | false      | admin     | answered
    -->
    <question-show-component
      v-for="item in list"
      :key="item.id"
      :question="item"
      :show-user="!history && store.isAdmin"
      :show-published="history || store.isAdmin"
      :full-content="!history && !store.isAdmin && item.published"
      :allow-answer="store.isAdmin"
      :allow-show="history || store.isAdmin"
      :allow-delete="!item.published && (history || store.isAdmin)"
      :allow-publish="!history && store.isAdmin && !!item.answer"
      @publish="onPublish(item.id)"
      @unpublish="onUnpublish(item.id)"
      @delete="onDelete(item.id)"
    />
  </paginated-list>
</template>
