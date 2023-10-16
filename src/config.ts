/* eslint-disable no-redeclare */
import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { Logger, Color } from '@starkow/logger'
import { join } from 'path'

dotenv.config({
  path: (process.env.NODE_ENV === 'development' && existsSync('.env.development')) ? '.env.development' : '.env',
})

const logger = Logger.create('config', Color.Cyan)

function getEnvironmentVariable (name: string): string | undefined
function getEnvironmentVariable (name: string, fallback: string): string
function getEnvironmentVariable (...values: string[]): string | undefined {
  const [name, fallback] = values
  const environmentVariable = process.env[name]

  if (environmentVariable == null) {
    logger.warn(`environment variable "${name}" is not defined. ${fallback ? `using fallback value "${fallback}".` : 'returning undefined.'}`)
  }

  return environmentVariable ?? fallback
}

export default {
  package: {
    name: getEnvironmentVariable('npm_package_name', 'unknown'),
    version: getEnvironmentVariable('npm_package_version', 'unknown'),
    mode: getEnvironmentVariable('NODE_ENV', 'production'),
  },
  telegram: {
    token: getEnvironmentVariable('BOT_TOKEN'),
    chatId: parseInt(getEnvironmentVariable('BOT_CHAT_ID', '-1'), 10),
  },
  discord: {
    webhookURL: getEnvironmentVariable('DISCORD_WEBHOOK_URL'),
  },
  redis: {
    url: getEnvironmentVariable('REDIS_URL', 'redis://127.0.0.1:6379'),
  },
  singularitySix: {
    accountsFilePath: getEnvironmentVariable('SINGULARITYSIX_ACCOUNTS_FILE_PATH', join(__dirname, '..', 'accounts.json')),
  },
  tracker: {
    utilityApi: {
      url: getEnvironmentVariable('TRACKER_UTILITY_URL', 'http://tracker:8080'),
      fallbackBuild: getEnvironmentVariable('TRACKER_FALLBACK_BUILD', '136154'),
    },
    maintenance: {
      probesCount: parseInt(getEnvironmentVariable('TRACKER_MAINTENANCE_PROBES_COUNT', '3'), 10),
      advancedProbesCount: parseInt(getEnvironmentVariable('TRACKER_MAINTENANCE_ADVANCED_PROBES_COUNT', '10'), 10),
      threshold: parseFloat(getEnvironmentVariable('TRACKER_MAINTENANCE_THRESHOLD', '0.75')),
      advancedThreshold: parseFloat(getEnvironmentVariable('TRACKER_MAINTENANCE_ADVANCED_THRESHOLD', '0.75')),
    },
  },
}
