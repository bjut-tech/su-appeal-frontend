export default (text: string, length: number = 100, ending: string = '...'): string => {
  if (text.length > length) {
    return text.substring(0, length - ending.length).trim() + ending
  } else {
    return text
  }
}
