import { css } from 'styled-components'
import { Size } from 'types';

// somehow sizes is ending up in markup, even if it is not a valid svg attribute
// until we have a better solution, just render it empty, instead to '[Object object]'
export function sanitizeSizes(sizes: Size) {
  return Object.defineProperty(sizes, 'toString', {
    value: () => '',
    enumerable: false
  })
}

export function createHelpers(width: number, height: number) {
  // TODO
  function getDimensions(size: Size | Size['name'], sizes?: Size[]) {
    if (
      size &&
      typeof size.width === 'number' &&
      typeof size.height === 'number'
    ) {
      return size
    }

    return size && sizes[size] ? sizes[size] : { width, height }
  }

  function getCss(size: Size, sizes?: Size[], fillColor?: string, fillColorRule?: string, noStyles?: boolean) {
    if (noStyles) {
      return ''
    }

    const dimensions = getDimensions(size, sizes)
    const fillRule =
      fillColor && fillColorRule
        ? `${fillColorRule}{ fill: ${fillColor}; }`
        : ''

    return css`
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      ${fillRule}
    `
  }

  const propsToCss = ({ size, sizes, fillColor, fillColorRule, noStyles }: { size: Size, sizes?: Size[], fillColor?: string, fillColorRule?: string, noStyles?: boolean }) =>
    getCss(size, sizes, fillColor, fillColorRule, noStyles)

  return { getDimensions, getCss, propsToCss }
}
