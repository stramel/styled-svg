import SVGO from 'svgo'
import crypto from 'crypto'

import removeXMLNS from './svgo-plugins/removeXmlns'
import addKeyAttribute from './svgo-plugins/addKeyAttribute'

// QUESTION: Is this a string?
export default function (content: string) {
  // generate a unique id prefix, to ensure id's stay unique
  const hash = crypto.createHash('sha1').update(content).digest('hex').slice(-10)

  const svgoOptions: SVGO.Options = {
    js2svg: {
      pretty: true,
      indent: 2
    },
    plugins: [
      { removeXMLNS },
      { removeScriptElement: true },
      { removeDimensions: true },
      { cleanupIDs: {
        remove: true,
        minify: true,
        prefix: `s-${hash}-`
      } },
      { removeTitle: true },
      { convertStyleToAttrs: false },
      { removeStyleElement: true },
      { addKeyAttribute },
      { sortAttrs: true }
    ]
  }

  const svgo = new SVGO(svgoOptions)
  return svgo.optimize(content, {})
}
