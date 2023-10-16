import { oneLine, stripIndents } from 'common-tags'
import redis from '../redis'
import { EAlertType, EPlatform, isServerAvailable, sendAlert } from '../utilities'
import { Cron } from './cron'
import config from '../config'

export default new Cron({
  expression: '* * * * *',
  handler: async () => {
    const latestPatch = await redis.get('patch:latest')
    if (!latestPatch) {
      console.error('Skipped `serverDegradationCheck` because latestPatch is empty')
      return
    }

    const maintenanceState = await redis.get('maintenance')
    if (maintenanceState && maintenanceState === 'failed') {
      return
    }

    const canJoinServer = await Promise.all(
      new Array(3).fill(null).map(() => isServerAvailable(true, latestPatch)),
    ).then(results => results.filter((result) => result).length >= 2)
    const cachedState = await redis.get('degradation')
    if ((cachedState ?? '') === (canJoinServer ? 'ok' : 'failed')) return

    await Promise.all([
      redis.set('degradation', canJoinServer ? 'ok' : 'failed'),
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.TECHNICAL,
        title: !canJoinServer
          ? oneLine`[EXPERIMENTAL] Palia is degraded`
          : oneLine`[EXPERIMENTAL] Palia server degradation is resolved`,
        content: !canJoinServer
          ? oneLine`${config.tracker.maintenance.advancedThreshold * 100}% of requests to connect to the server ended in an error`
          : undefined,
      }),
      sendAlert({
        platform: EPlatform.DISCORD,
        type: EAlertType.TECHNICAL,
        title: !canJoinServer
          ? oneLine`Проблемы с доступом к серверам`
          : oneLine`Palia снова доступна для всех игроков`,
        content: !canJoinServer
          ? stripIndents`
              ${config.tracker.maintenance.advancedThreshold * 100}% попыток зайти на сервер завершились ошибкой

              **Внимание:** данный способ проверки является экспериментальным и может быть ложным
            `
          : oneLine`**Внимание:** данный способ проверки является экспериментальным и может быть ложным`,
      }),
    ])
  },
})
