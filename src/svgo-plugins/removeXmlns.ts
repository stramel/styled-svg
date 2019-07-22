type Attribute = {
  local: boolean
  prefix: string
  name: string
}

type Item = {
  eachAttr: (callback: (attr: Attribute) => void) => void
  removeAttr: (attr: string) => void
}

export default {
  type: 'perItem',
  description:
    'remove xmlns, xmlns:xlink, because { removeXMLNS: true } can not handle both',
  fn: (item: Item) => {
    item.eachAttr(attr => {
      if (attr.local && attr.prefix === 'xmlns') {
        item.removeAttr(attr.name)
      }
    })
  }
}
