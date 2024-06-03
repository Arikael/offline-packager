import { type LevelWithSilentOrString, type Logger, pino } from 'pino'

export const logLevels: LevelWithSilentOrString[] = Object.keys(
  pino.levels.values,
).concat(['silent'])
let logger: Logger = pino()

export const initLogger = (
  logLevel: LevelWithSilentOrString,
  logDestination: string,
) => {
  logger = pino(
    {
      level: logLevel,
    },
    pino.destination(logDestination === '1' ? 1 : logDestination),
  )
}

const benchmarks = new Map<
  string,
  { start: number; stop: number; msg: string }
>()

export const startBenchmark = (id: string, msg: string) => {
  benchmarks.set(id, { start: performance.now(), stop: -1, msg: msg })
}

export const stopBenchmark = (id: string) => {
  const benchmark = benchmarks.get(id)

  if (benchmark) {
    benchmark.stop = performance.now()
    benchmarks.set(id, benchmark)
  }
}

export const logBenchmarks = () => {
  for (const [_, value] of benchmarks.entries()) {
    const timeElapsed = (value.stop - value.start) / 1000
    logger.info(timeElapsed, value.msg)
  }
}

export { logger }
