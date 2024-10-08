export const campusOptions = [
  { text: '平乐园校区', value: 'MAIN' },
  { text: '中蓝校区', value: 'ZHONGLAN' }
]

export const getCampusName = (value: string): string => {
  return campusOptions.find((item) => item.value === value)?.text ?? ''
}
