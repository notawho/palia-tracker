import { PaliaWrapper } from '../wrappers'
import { EAlertType, EPlatform, formatBytes, getFileMeta, sendAlert } from '../utilities'
import { Cron } from './cron'
import redis from '../redis'

export default new Cron({
  expression: '*/5 * * * *',
  handler: async () => {
    const versionManifest = await PaliaWrapper.getGameManifest()
    if (!versionManifest) return

    const hasInCache = await redis.get(`game:${versionManifest.version}`)
    if (hasInCache) return

    const fileMeta = await getFileMeta(versionManifest.url)

    await Promise.all([
      redis.set(`game:${versionManifest.version}`, versionManifest.url),
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.PATCH,
        title: 'Base game has been updated:',
        content: `· <b>${versionManifest.version}</b> | <a href="${versionManifest.url}">Download</a> <i>${fileMeta ? `(~${formatBytes(fileMeta.length)})` : ''}</i>`,
      }),
    ])
  },
})
