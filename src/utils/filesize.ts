import { partial } from 'filesize'

const filesize = partial({
  base: 2,
  round: 1,
  standard: 'jedec'
})

export default filesize
