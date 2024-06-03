import { Command, Option } from '@commander-js/extra-typings'
import {
  initLogger,
  logBenchmarks,
  logLevels,
  startBenchmark,
  stopBenchmark,
} from './lib/logger.js'
import { DependencyResolver } from './lib/dependencyResolver'
import { CacheType } from './lib/caching/cacheType'
import { createCache } from './lib/caching/cache'
import { DependencyDownloader } from './lib/dependencyDownloader'

const program = new Command()
// global
program
  .addOption(
    new Option('-l, --log-level <level>', 'sets the log level')
      .choices(logLevels)
      .default('info'),
  )
  .option(
    '--log-destination <destination>',
    'sets the destination (filepath or 1 for STDOUT) to where the logs are written',
    '1',
  )
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts()
    initLogger(opts.logLevel, opts.logDestination)
  })
//  fetch packages
program
  .command('fetch')
  .description('fetches packages from npm registry')
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
  .option(
    '-c, --concurrency <amount>',
    'defines how many concurrent downloads happen',
  )
  .addOption(
    new Option('-a, --cache <cacheType>', 'defines which cache is used')
      .default(CacheType.Sqlite)
      .choices(Object.values(CacheType)),
  )
  .action(async (options) => {
    const cache = await createCache(options.cache)
    const runId = await cache.getNextRunId()

    startBenchmark('resolving', 'resolving dependencies completed')
    const dependencyResolver = new DependencyResolver(cache, runId)
    const dependenciesToDownload = await dependencyResolver.resolvePackageJson(
      options.packageJson,
    )
    stopBenchmark('resolving')

    startBenchmark('downloading', 'downloading dependencies completed')
    const dependencyDownloader = new DependencyDownloader(cache)
    await dependencyDownloader.downloadDependencies(
      dependenciesToDownload,
      options.destination,
    )
    stopBenchmark('downloading')

    logBenchmarks()
  })

program.parse()
