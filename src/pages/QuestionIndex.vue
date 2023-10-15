<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import PaginatedList from '../components/PaginatedList.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Question } from '../types/Question'

const props = defineProps<{
  history?: boolean
}>()

const store = useStore()

const router = useRouter()

const list = ref<Question[]>([])

const onShow = (id: number): void => {
  if (props.history || store.isAdmin) {
    router.push(`/questions/${id}`)
  }
}

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这则反馈吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`questions/${id}`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        list.value = list.value.filter((item) => item.id !== id)
      })
      .catch((e) => {
        console.error(e)
        showToast({
          type: 'fail',
          message: '删除失败'
        })
      })
  })
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
      :class="{ 'cursor-pointer select-none': history || store.isAdmin }"
      :question="item"
      :show-user="!history && store.isAdmin"
      :show-published="history || store.isAdmin"
      :full-content="!history && !store.isAdmin && item.published"
      :allow-answer="store.isAdmin"
      :allow-delete="!item.published && (history || store.isAdmin)"
      :allow-publish="!history && store.isAdmin && !!item.answer"
      @click="onShow(item.id)"
      @delete="onDelete(item.id)"
    />
  </paginated-list>
</template>
