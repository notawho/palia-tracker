import { Logger, Color, TextStyle } from '@starkow/logger'
import { oneLine } from 'common-tags'

import config from './config'
import cron from './cron'
import { schedule } from 'node-cron'
import redis from './redis'

const logger = Logger.create('index', Color.Gray)

const init = async () => {
  logger(oneLine`
    starting
    ${Logger.color(config.package.name, Color.Blue, TextStyle.Bold)}
    ${Logger.color(`(${config.package.version})`, Color.Blue)}
    in ${Logger.color(config.package.mode, Color.Blue, TextStyle.Bold)} mode...
  `)

  if (config.package.mode === 'development') {
    await redis.flushall()
  }

  for (const cronTask of cron) {
    schedule(cronTask.expression, (now) => cronTask.run(now))
    cronTask.run(Date.now())
  }

  logger('started')
}

init()
  .catch(Logger.create('error', Color.Red, TextStyle.Bold).error)
