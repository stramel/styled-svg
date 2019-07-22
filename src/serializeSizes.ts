import { Options, Size } from './types'

export function serializeSizes(options: Options) {
  const sizes: Size[] = []
  if (options.size) {
    options.size.forEach(size => {
      const [name, dimesions] = size.split(':').map(part => part.trim())
      if (!name || !dimesions) { return }
      const [width, height] = dimesions.split('x').map(Number)
      if (isNaN(width) || isNaN(height)) { return }
      sizes.push({ name, width, height })
    })
  }
  if (!sizes.length) { return '{}' }
  return `{${sizes.map(({ name, width, height }) =>
    `\n  ${name}: { width: ${width}, height: ${height} }`
  )}\n}`
}
