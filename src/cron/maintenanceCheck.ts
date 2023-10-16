import { oneLine } from 'common-tags'
import { Cron } from './cron'
import redis from '../redis'
import { EAlertType, EPlatform, isServerAvailable, sendAlert } from '../utilities'
import { NOTICE_TRANSLATIONS } from './noticeCheck'

export default new Cron({
  expression: '* * * * *',
  handler: async () => {
    const isAvailable = await isServerAvailable()

    const cachedState = await redis.get('maintenance')
    if ((cachedState ?? '') === (isAvailable ? 'ok' : 'failed')) return

    const noticeResponse = await fetch(`https://download.palia.com/assets/greeting/maintenance-en.txt?ts=${Date.now()}`)
    const notice = noticeResponse.ok ? await noticeResponse.text() : undefined
    const noticeTranslation = notice
      ? NOTICE_TRANSLATIONS
        .find((translation) => translation.original.test(notice))
        ?.translate(notice)
      : undefined

    await Promise.all([
      redis.set('maintenance', isAvailable ? 'ok' : 'failed'),
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: !isAvailable
          ? EAlertType.INCIDENT
          : EAlertType.INCIDENT_RESOLVED,
        title: !isAvailable
          ? oneLine`Palia is under maintenance`
          : oneLine`Palia is now available`,
      }),
      sendAlert({
        platform: EPlatform.DISCORD,
        type: !isAvailable
          ? EAlertType.INCIDENT
          : EAlertType.INCIDENT_RESOLVED,
        title: !isAvailable
          ? oneLine`Доступ к серверам игры временно недоступен`
          : oneLine`Сервера игры теперь доступны`,
        content: (notice && !isAvailable) ? noticeTranslation ?? notice : undefined,
      }),
    ])
  },
})
