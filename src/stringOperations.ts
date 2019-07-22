const lowercaseWords = /(?:^\w|[A-Z]|\b\w)/g
const wordSeparators = /[\s-:]+/g

export function camelCase(str?: string) {
  if (!str) return
  return str
  .trim()
  .replace(lowercaseWords, (letter, index) => index === 0 ? letter.toLowerCase() : letter.toUpperCase())
  .replace(wordSeparators, '')
}

export function pascalCase(str?: string) {
  if (!str) return
  const camel = camelCase(str)!
  return camel[0].toUpperCase() + camel.slice(1)
}

