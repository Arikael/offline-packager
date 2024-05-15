import * as fs from 'node:fs'
import p from 'pacote'
import { logger } from './logger.js'

export const fetchFromPackageJson = async (packageJsonPath: string) => {
  const dependencies = await getPackageJsonContent(packageJsonPath)
  logger.info('et')
  for (const [key, value] of dependencies) {
    const m = await p.manifest(key + '@' + value)
    console.log(m)
    break
  }
}

const getPackageJsonContent = async (
  packageJsonPath: string,
): Promise<Map<string, string>> => {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('packageJsonPath does not exist')
  }

  const packageJson = await fs.promises.readFile(packageJsonPath, 'utf8')
  const content = JSON.parse(packageJson)

  if (content.dependencies) {
    return new Map(Object.entries(content.dependencies))
  }

  return new Map()
}
