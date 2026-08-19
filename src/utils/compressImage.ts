const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.7

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export async function compressImage(file: File): Promise<string> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  let { width, height } = img
  if (width > height && width > MAX_DIMENSION) {
    height = Math.round((height / width) * MAX_DIMENSION)
    width = MAX_DIMENSION
  } else if (height > MAX_DIMENSION) {
    width = Math.round((width / height) * MAX_DIMENSION)
    height = MAX_DIMENSION
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported')
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
