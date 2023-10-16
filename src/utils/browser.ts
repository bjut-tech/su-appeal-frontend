const isWeixin = (): boolean => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

export default {
  isWeixin
}
