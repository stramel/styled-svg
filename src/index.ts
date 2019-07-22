import prettier from 'prettier'
import fs from 'fs-extra'
import path from 'path'
import { Options } from './types'

const indent = require('./indent')
const optimize = require('./optimize')
import serializeSizes from './serializeSizes'
import { pascalCase } from './stringOperations'


async function writeOut(filePath: string, content: string, options: Options) {
  if (options.dryRun) {
    console.log('\n')
    console.log(filePath)
    console.log(content)
  } else {
    await fs.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, content)
  }
}

const endsWithSvg = /\.svg$/i
const viewBoxAttribute = /viewBox="([\s-\d.]+)"/i
const whitespace = /\s+/

function join(...args: string[]) {
  return path.normalize(path.join(...args))
}

async function convertFile(filePath: string, templates: Templates, options: Options) {
  let viewBox = [0, 0, 0, 0]

  // determine names
  const displayName = pascalCase(path.basename(filePath).replace(endsWithSvg, ''))
  const componentFilename = displayName + '.js'
  const testFilename = displayName + '.test.js'

  // resolve paths
  const testDir = options.testDir || './'
  const outputDir = options.outputDir || path.dirname(filePath)
  const outputTestDir = join(outputDir, testDir)
  const importRelativePath = path.relative(outputTestDir, outputDir).replace(path.sep, '/') || '.'

  // load file content
  const origContent = await fs.readFile(filePath, 'utf8')

  // get clean up viewBox
  let tempViewBox = origContent.match(viewBoxAttribute)
  let foundViewbox = false
  if (tempViewBox && tempViewBox[1].trim()) {
    tempViewBox = tempViewBox[1].trim().split(whitespace)
    if (tempViewBox.length === 4) {
      viewBox = tempViewBox.map(number => Math.round(parseFloat(number) || 0))
      foundViewbox = true
    }
  }

  // exit if viewbox was missing
  if (!foundViewbox) {
    console.error(
      'Skipped',
      filePath.replace(process.cwd(), '.'),
      'viewBox attribute missing or malformated'
    )
    return
  }

  // run SVG optimizers
  const content = await optimize(origContent)

  // react formatted SVG
  const formattedContent = indent(content.data)

  // handle size alias options
  const sizes = serializeSizes(options)

  const prettierConfig = await prettier.resolveConfig(filePath)

  // output component and test file
  await Promise.all([
    writeOut(
      join(outputDir, componentFilename),
      prettier.format(
        templates.component
          .replace('##SVG##', formattedContent)
          .replace('##WIDTH##', viewBox[2].toString())
          .replace('##HEIGHT##', viewBox[3].toString())
          .replace('##VIEWBOX##', viewBox.join(' '))
          .replace('##NAME##', displayName)
          .replace('\'##SIZES##\'', sizes),
        prettierConfig || undefined
      ),
      options
    ),
    !options.noTests ? writeOut(
      join(outputTestDir, testFilename),
      templates.test
        .replace('##FILENAME##', `${importRelativePath}/${componentFilename}`)
        .replace(/##NAME##/g, displayName),
      options
    ) : Promise.resolve()
  ])

  console.log('Converted',
    filePath.replace(process.cwd(), '.'),
    ' => ',
    path.join(outputDir.replace(process.cwd(), '.'), displayName)
  )
}

type Templates = {
  component: string
  test: string
}

export default async function(files: string[], options: Options) {
  // load templates
  const templatesDir = options.templatesDir || join(__dirname, '..', 'templates')
  const templates: Templates = {
    component: await fs.readFile(join(templatesDir, 'component.js'), 'utf8'),
    test: await fs.readFile(join(templatesDir, 'test.js'), 'utf8')
  }

  // clean output directories
  if (options.clean) {
    const del = (await import('del')).default
    if (options.outputDir) {
      await del([
        join(options.outputDir, '*.js')
      ])
    }
    if (options.testDir) {
      await del([
        join(options.testDir, '*.test.js')
      ])
    }
  }

  // convert files
  return Promise.all(files.map(file => convertFile(file, templates, options)))
}
