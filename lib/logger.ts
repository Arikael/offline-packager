import { type LevelWithSilentOrString, type Logger, pino } from 'pino'

export const logLevels: LevelWithSilentOrString[] = Object.keys(
  pino.levels.values,
).concat(['silent'])
let logger: Logger = pino()

export const initLogger = (logLevel: LevelWithSilentOrString) => {
  logger = pino({
    level: logLevel,
  })
}

export { logger }
