import { PaliaWrapper } from '../wrappers'
import { EAlertType, EPlatform, formatBytes, getFileMeta, sendAlert } from '../utilities'
import { Cron } from './cron'
import redis from '../redis'

export default new Cron({
  expression: '*/5 * * * *',
  handler: async () => {
    const launcherManifest = await PaliaWrapper.getLauncherManifest()
    if (!launcherManifest) return

    const hasInCache = await redis.get(`launcher:${launcherManifest.version}`)
    if (hasInCache) return

    const fileMeta = await getFileMeta(launcherManifest.url)

    await Promise.all([
      redis.set(`launcher:${launcherManifest.version}`, launcherManifest.url),
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.PATCH,
        title: 'New launcher version has been released:',
        content: `· <b>${launcherManifest.version}</b> | <a href="${launcherManifest.url}">Download</a> <i>${fileMeta ? `(~${formatBytes(fileMeta.length)})` : ''}</i>`,
      }),
      sendAlert({
        platform: EPlatform.DISCORD,
        type: EAlertType.PATCH,
        title: `Лаунчер обновлён до версии \`${launcherManifest.version}\``,
      }),
    ])
  },
})
