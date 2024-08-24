<script setup lang="ts">
import { useSchoolList } from '../lib/school.ts'
import type { SchoolInfo } from '../types/school.ts'

const schools = useSchoolList()

const navigate = (school: SchoolInfo): void => {
  location.href = school.domain
}
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-4">
    <van-cell-group inset>
      <van-cell
        v-for="school of schools"
        :key="school.name"
        size="large"
        :title="school.name"
        :label="school.domain"
        :is-link="!school.active"
        center
        @click="navigate(school)"
      >
        <template #icon>
          <img
            :src="school.logo"
            :alt="'logo of ' + school.name"
            class="w-12 h-12 mr-3 rounded-full"
          >
        </template>
        <template
          v-if="school.active"
          #right-icon
        >
          <van-icon
            size="18"
            class="text-green-500"
            class-prefix="bi"
            name="check2-circle"
          />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>
