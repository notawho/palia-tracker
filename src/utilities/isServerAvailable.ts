import { existsSync } from 'fs'
import config from '../config'
import { S6Wrapper } from '../wrappers'
import { Color, Logger } from '@starkow/logger'
import { readFile } from 'fs/promises'

interface IAccountData {
  slug: string
  name: string
  email: string
  password: string
}

const logger = Logger.create('utilities:isServerAvailable', Color.Gray)

const availableCheck = async (singularityWrapper: S6Wrapper, advancedCheck: boolean = false, clientPatch: string = config.tracker.utilityApi.fallbackBuild) => {
  await singularityWrapper.login()

  const isLoginValidated = await singularityWrapper.authValidate()
  if (!isLoginValidated) {
    return false
  }

  const getCharacterProbes = await Promise.all(
    new Array(config.tracker.maintenance.probesCount).fill(null).map(() => singularityWrapper.getCharacters()),
  )

  const canGetCharacter = getCharacterProbes.filter((probe) => probe).length >= (config.tracker.maintenance.probesCount * config.tracker.maintenance.threshold)

  if (advancedCheck && canGetCharacter) {
    const [character] = getCharacterProbes.filter((probe) => probe)[0]

    const joinServerProbes = await Promise.all(
      new Array(config.tracker.maintenance.advancedProbesCount).fill(null).map(() => singularityWrapper.joinServer(character.character_id!, clientPatch)),
    )

    const canJoinServer = joinServerProbes.filter((probe) => Object.keys(probe).includes('number')).length >= (config.tracker.maintenance.advancedProbesCount * config.tracker.maintenance.threshold)

    return canGetCharacter && canJoinServer
  }

  return canGetCharacter
}

export const isServerAvailable = async (advancedCheck: boolean = false, clientPatch: string = config.tracker.utilityApi.fallbackBuild) => {
  if (!config.singularitySix.accountsFilePath && existsSync(config.singularitySix.accountsFilePath)) {
    logger.warn('Unable to load accounts: file doesn\'t exist.')
    return false
  }

  const accounts = await readFile(config.singularitySix.accountsFilePath, 'utf-8')
    .then((value) => JSON.parse(value) || [])
    .catch((error) => {
      logger.error('Unable to load accounts:', error)
      return []
    })

  if (!accounts.length) {
    logger.warn('Accounts list is empty')
    return false
  }

  const results = await Promise.all(
    accounts.map((accountData: IAccountData) => {
      const wrapper = new S6Wrapper({
        email: accountData.email,
        password: accountData.password,
      })

      return availableCheck(wrapper, advancedCheck, clientPatch)
    }),
  )

  return results.filter((result) => result).length >= config.tracker.maintenance.threshold
}
