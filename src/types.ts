
export type Options = Partial<{
  clean: boolean
  dryRun: boolean
  input: string[]
  noTests: boolean
  outputDir: string
  size: string[]
  templatesDir: string
  testDir: string
}>

export type Size = {
  name: string
  height: number
  width: number
}
