<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showConfirmDialog, showToast } from 'vant'
import type { ActionSheetAction } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import BlockLoading from '../components/BlockLoading.vue'
import type { AnnouncementCategory } from '../types/announcement.ts'

const {
  data,
  isLoading,
  execute: fetchData
} = useAxios<AnnouncementCategory[]>('announcements/categories', useAxiosInstance(), {
  immediate: true,
  initialData: []
})

const actions = ref<ActionSheetAction[]>([
  {
    name: '编辑',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        onEdit(actionsFor.value)
      }
    }
  },
  {
    name: '删除',
    color: '#ee0a24',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        onDelete(actionsFor.value)
      }
    }
  }
])

const actionsFor = ref<number | null>(null)

const actionsShow = ref<boolean>(false)

const editing = ref<number | boolean>(false)

const editingForm = ref<Partial<AnnouncementCategory>>({
  name: '',
  description: ''
})

const editingErrors = ref<Record<string, string>>({})

const onChoose = (id: number): void => {
  actionsFor.value = id
  actionsShow.value = true
}

const onEdit = (id: number): void => {
  const category = data.value?.find((item) => item.id === id)
  if (category) {
    editingForm.value = {
      name: category.name,
      description: category.description
    }
    editingErrors.value = {}
    editing.value = category.id
  }
}

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这个公告类别吗？',
    confirmButtonText: '删除',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`announcements/categories/${id}`)
      .catch(() => {
        showToast({
          type: 'fail',
          message: '删除失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  })
}

const onCreate = (): void => {
  editingForm.value = {
    name: '',
    description: ''
  }
  editingErrors.value = {}
  editing.value = true
}

const onSaveEdit = (): void => {
  editingErrors.value = {}
  if (!editingForm.value.name?.trim()) {
    editingErrors.value.name = '不能为空'
    return
  }

  if (editing.value === true) {
    useAxiosInstance()
      .post('announcements/categories', {
        name: editingForm.value.name,
        description: editingForm.value.description
      })
      .then(() => {
        showToast({
          type: 'success',
          message: '创建成功'
        })
      })
      .catch(() => {
        showToast({
          type: 'fail',
          message: '保存失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  } else {
    useAxiosInstance()
      .patch(`announcements/categories/${editing.value}`, {
        name: editingForm.value.name,
        description: editingForm.value.description
      })
      .then(() => {
        showToast({
          type: 'success',
          message: '保存成功'
        })
      })
      .catch(() => {
        showToast({
          type: 'fail',
          message: '保存失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  }
  editing.value = false
}

const onCancelEdit = (): void => {
  editing.value = false
}
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-4">
    <block-loading v-if="isLoading" />
    <p
      v-else-if="!data?.length"
      class="text-center px-4 text-sm text-gray-500 dark:text-neutral-400"
    >
      暂无公告类别，请先创建
    </p>
    <van-cell-group
      v-else
      inset
    >
      <van-cell
        v-for="item in data"
        :key="item.id"
        icon-prefix="bi"
        icon="inbox"
        :title="item.name"
        is-link
        center
        @click="onChoose(item.id)"
      />
    </van-cell-group>
    <div class="flex justify-evenly items-stretch px-4 gap-4">
      <van-button
        type="primary"
        icon-prefix="bi"
        icon="plus-lg"
        block
        @click="onCreate"
      >
        创建新类别
      </van-button>
    </div>
    <van-popup
      :show="editing !== false"
      teleport="body"
      position="center"
      round
      close-on-popstate
      :duration="0.2"
      :close-on-click-overlay="false"
      safe-area-inset-bottom
    >
      <div class="flex items-center">
        <button
          class="flex-shrink-0 text-gray-500 dark:text-neutral-400 text-sm cursor-pointer px-6 py-2"
          @click="onCancelEdit"
        >
          取消
        </button>
        <h5 class="flex-1 text-lg font-medium text-center py-2">
          {{ typeof editing === 'number' ? '编辑' : '创建' }}公告类别
        </h5>
        <button
          class="flex-shrink-0 text-brand text-sm cursor-pointer px-6 py-2"
          @click="onSaveEdit"
        >
          保存
        </button>
      </div>
      <van-cell-group
        class="!m-2 !mb-6"
        inset
      >
        <van-field
          v-model="editingForm.name"
          type="text"
          label="名称"
          placeholder="请输入类别名称"
          value-class="text-semibold"
          :error="!!editingErrors.name"
          :error-message="editingErrors.name"
          maxlength="85"
          autocomplete="off"
        />
        <van-field
          v-model="editingForm.description"
          type="text"
          label="备注"
          placeholder="选填"
          :error="!!editingErrors.description"
          :error-message="editingErrors.description"
          maxlength="10000"
          autocomplete="off"
        />
      </van-cell-group>
    </van-popup>
    <van-action-sheet
      teleport="body"
      :show="actionsShow"
      :actions="actions"
      title="编辑公告类别"
      cancel-text="取消"
      :duration="0.2"
      close-on-click-overlay
      safe-area-inset-bottom
      @cancel="actionsShow = false"
      @close="actionsShow = false"
    />
  </div>
</template>
