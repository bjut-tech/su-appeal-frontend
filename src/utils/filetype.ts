export const isImage = (name: string): boolean => {
  const parts = name.split('.')

  if (parts.length < 2) {
    return false
  }

  const ext = parts[parts.length - 1].toLowerCase()
  return [
    'apng',
    'avif',
    'bmp',
    'gif',
    'ico',
    'jpeg',
    'jpg',
    'png',
    'svg',
    'tif',
    'tiff',
    'webp'
  ].includes(ext)
}
