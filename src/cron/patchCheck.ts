import { oneLine } from 'common-tags'
import { PaliaWrapper } from '../wrappers'
import { EAlertType, EPlatform, formatBytes, getFileMeta, sendAlert } from '../utilities'
import { Cron } from './cron'
import redis from '../redis'

export default new Cron({
  expression: '*/5 * * * *',
  handler: async () => {
    const patchManifest = await PaliaWrapper.getPatchManifest()
    if (!patchManifest) return

    const patches = []

    for (const [version, patchMeta] of Object.entries(patchManifest)) {
      const hasInCache = await redis.get(`patch:${version}`)
      if (hasInCache) continue

      const filesMeta = await Promise.all(patchMeta.Files.map((file) => getFileMeta(file.URL)))
      const overallSize = filesMeta.filter((meta) => meta).reduce((a, b) => a + b!.length, 0)

      await redis.set(`patch:${version}`, JSON.stringify(patchMeta))
      patches.push({
        version,
        isBaseline: patchMeta.BaseLineVer === true,
        overallSize,
        filesChanged: patchMeta.Files.length,
      })
    }

    if (!patches.length) return

    const patchText = patches.map((patch) => oneLine`
      · <b>${patch.version}:</b>
      ${patch.isBaseline ? 'baseline version,' : ''}
      ${patch.filesChanged} files changed
      <i>(~${formatBytes(patch.overallSize)})</i>`,
    )

    await Promise.all([
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.PATCH,
        title: `New ${patchText.length > 1 ? 'patches' : 'patch'} has been released:`,
        content: patchText.join('\n'),
      }),
      sendAlert({
        platform: EPlatform.DISCORD,
        type: EAlertType.PATCH,
        title: `Патч доступен для скачивания: \`${patches.at(-1)!.version}\` *(~${formatBytes(patches.at(-1)!.overallSize)})*`,
      }),
    ])
  },
})
