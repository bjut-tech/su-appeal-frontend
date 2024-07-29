import { computed } from 'vue'
import type { ComputedRef } from 'vue'

import type { SchoolInfo, SchoolInfoBase } from '../types/school'

import logoDefault from '../assets/images/bjut-logo.svg?url'

export const schoolDefault: SchoolInfoBase = {
  name: '信息学部',
  logo: logoDefault
}

export const schools: SchoolInfo[] = [
  {
    domain: 'https://appeal.bjut.tech',
    name: '信息科学技术学院'
  },
  {
    domain: 'https://appeal-cs.bjut.tech',
    name: '计算机学院'
  }
]

const schoolRef = computed<SchoolInfoBase>(() => {
  const domain = window.location.origin
  const school = schools.find(school => school.domain === domain)
  return Object.assign({}, schoolDefault, school)
})

export const useSchool = (): ComputedRef<SchoolInfoBase> => {
  return schoolRef
}

type SchoolListItem = SchoolInfoBase & SchoolInfo & {
  active: boolean
}

const schoolListRef = computed<SchoolListItem[]>(() => {
  const domain = window.location.origin
  return schools.map((school) => {
    return Object.assign({}, schoolDefault, school, {
      active: school.domain === domain
    })
  })
})

export const useSchoolList = (): ComputedRef<SchoolListItem[]> => {
  return schoolListRef
}
