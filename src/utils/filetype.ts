export const isImage = (name: string): boolean => {
  const ext = name.split('.').pop()
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
