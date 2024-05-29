import { Command, Option } from '@commander-js/extra-typings'
import { type LevelWithSilentOrString } from 'pino'
import { initLogger, logLevels } from './lib/logger.js'
import { DependencyResolver } from './lib/dependencyResolver'
import { DependencyDownloader } from './lib/dependencyDownloader'
import { CacheType } from './lib/caching/cacheType'
import { createCache } from './lib/caching/cache'

const program = new Command()
// global
program
  .addOption(
    new Option('-l, --log-level <level>', 'sets the log level').choices(
      logLevels,
    ),
  )
  .on('option:log-level', (level: LevelWithSilentOrString) => {
    initLogger(level)
  })

//  fetch packages
program
  .command('fetch')
  .description('fetches packages from npm registry')
  .alias('f')
  .requiredOption(
    '-p, --package-json <package-json-path>',
    'path to the package.json file',
    './package.json',
  )
  .option(
    '-d, --destination <destination>',
    'path to where the tar files are saved',
    './packages',
  )
  .option('-n, --no-tar', 'dont create a tar with all the downloaded packages')
  .option('-c, --concurrency', 'defines how many concurrent downloads happen')
  .addOption(
    new Option('-a, --cache <cacheType>', 'defines which cache is used')
      .default(CacheType.Sqlite)
      .choices(Object.values(CacheType)),
  )
  .action(async (options) => {
    const cache = await createCache(options.cache)
    const dependencyResolver = new DependencyResolver(cache)
    const dependenciesToDownload = await dependencyResolver.resolvePackageJson(
      options.packageJson,
    )

    const dependencyDownloader = new DependencyDownloader(cache)
    await dependencyDownloader.downloadDependencies(
      dependenciesToDownload,
      options.destination,
    )
  })

program.parse()
