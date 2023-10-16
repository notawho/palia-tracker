import redis from '../redis'
import { PaliaWrapper } from '../wrappers'
import { Cron } from './cron'
import { EAlertType, EPlatform, sendAlert } from '../utilities'

export default new Cron({
  expression: '* * * * *',
  handler: async () => {
    const gameConfigManifest = await PaliaWrapper.getGameConfigManifest()
    if (!gameConfigManifest) return

    const enabledConfigs = gameConfigManifest.entries.filter((entry) => entry.valid_at_timestamp > 0)
    const newConfigs = await Promise.all(
      enabledConfigs.map(async (entry) => {
        const cachedResult = await redis.get(`game_config:${entry.name}:${entry.version}`)

        return {
          ...entry,
          isCached: cachedResult !== null,
          url: `https://gameconfig.singularity6.com/${entry.name}-${entry.version}.json`,
        }
      }),
    ).then((entries) => entries.filter((entry) => !entry.isCached))
    if (!newConfigs.length) return

    await Promise.all([
      newConfigs.map((entry) => redis.set(`game_config:${entry.name}:${entry.version}`, entry.url)),
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.PATCH,
        title: 'Dynamic configuration has been updated:',
        content: newConfigs.map((entry) => `· <b>${entry.name}:</b> <a href="${entry.url}">link</a>, version: <code>${entry.version}</code>`).join('\n'),
      }),
    ])
  },
})
