<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios'
import { useStore } from '../lib/store'
import CampusSelect from '../components/CampusSelect.vue'
import PaginatedList from '../components/PaginatedList.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import { getCampusName } from '../types/Campus'
import type { Question } from '../types/Question'

defineProps<{
  history?: boolean
}>()

const store = useStore()

const list = ref<Question[]>([])

const {
  data: listLiked,
  execute: fetchListLiked
} = useAxios<number[]>('questions/liked-answers', useAxiosInstance(), {
  initialData: [],
  immediate: false
})

const filterCampus = ref<string>('')
const filterSearch = ref<string>('')
const listFiltered = computed<Question[]>(() => {
  return list.value.filter((item) => {
    if (filterCampus.value && item.campus !== filterCampus.value) {
      return false
    }

    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase()
      if (!(
        item.content.toLowerCase().includes(search) ||
        item.answer?.content.toLowerCase().includes(search)
      )) {
        return false
      }
    }

    return true
  })
})

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

const onLike = (id: number): void => {
  if (!listLiked.value) {
    listLiked.value = []
  }

  list.value = list.value.map((item) => {
    if (item.id === id && item.answer) {
      item.answer.likesCount++
      listLiked.value?.push(item.answer.id)
    }
    return item
  })
}

const onUnlike = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id && item.answer) {
      item.answer.likesCount--
      if (item.answer.likesCount < 0) {
        item.answer.likesCount = 0
      }

      listLiked.value = (listLiked.value ?? []).filter((item1) => {
        return item1 !== item.answer?.id
      })
    }
    return item
  })
}

const onDelete = (id: number): void => {
  list.value = list.value.filter((item) => item.id !== id)
}

onMounted(() => {
  if (store.loggedIn) {
    fetchListLiked()
  }
})
</script>

<template>
  <paginated-list
    ref="listComponent"
    v-slot="{ check }"
    v-model="list"
    :url="history ? 'questions/history' : 'questions'"
    custom-class="flex flex-col px-4 py-6 gap-4"
    pull-refresh
  >
    <div
      v-if="!history"
      class="flex gap-3 items-stretch"
    >
      <campus-select
        v-slot="{ trigger }"
        v-model="filterCampus"
        @update:model-value="check()"
      >
        <button
          class="flex-shrink-0 inline-flex gap-1 items-center px-4 py-2 bg-white dark:bg-neutral-900 text-sm rounded-lg"
          :class="{ 'text-brand': filterCampus, 'text-gray-500 dark:text-neutral-400': !filterCampus }"
          @click="filterCampus ? filterCampus = '' : trigger()"
        >
          <i class="bi bi-funnel" />
          {{ filterCampus ? getCampusName(filterCampus) : '校区' }}
        </button>
      </campus-select>
      <van-field
        v-model="filterSearch"
        class="bg-white dark:bg-neutral-900 text-sm text-gray-500 dark:text-neutral-400 !px-4 !py-2 rounded-lg"
        :border="false"
        icon-prefix="bi"
        left-icon="search"
        placeholder="搜索反馈内容..."
        @update:model-value="check()"
      />
    </div>
    <!--              | history    | published | all (admin)
    --- show          | true       | false     | true
    --- showUser      | false      | admin     | true
    --- showPublished | true       | admin     | true
    --- fullContent   | false      | true      | published
    --- allowDelete   | !published | false     | !published
    --- allowPublish  | false      | admin     | answered
    -->
    <question-show-component
      v-for="item in listFiltered"
      :key="item.id"
      :question="item"
      :answer-liked="listLiked?.includes(item.answer?.id ?? -1)"
      :show-user="!history && store.isAdmin"
      :show-published="history || store.isAdmin"
      :hide-campus="!!filterCampus"
      :full-content="!history && !store.isAdmin && item.published"
      :allow-answer="store.isAdmin"
      :allow-show="history || store.isAdmin"
      :allow-delete="!item.published && (history || store.isAdmin)"
      :allow-publish="!history && store.isAdmin && !!item.answer"
      @publish="onPublish(item.id)"
      @unpublish="onUnpublish(item.id)"
      @like="onLike(item.id)"
      @unlike="onUnlike(item.id)"
      @delete="onDelete(item.id)"
    />
  </paginated-list>
</template>
