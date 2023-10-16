import { Cron } from './cron'
import redis from '../redis'
import { EAlertType, EPlatform, dateConverter, sendAlert } from '../utilities'

export const NOTICE_TRANSLATIONS = [
  {
    key: 'maintenance',
    original: /Palia\sis\sdown\sfor\smaintenance/i,
    translate: (_: string) => {
      return '```Palia закрыта на техническое обслуживание, мы скоро вернёмся!```'
    },
  },
  {
    key: 'maintenance',
    original: /Servers\sare\scurrently\sdown/i,
    translate: (_: string) => {
      return '```Сервера на данный момент недоступны, вернитесь позднее.```'
    },
  },
  {
    key: 'experience_issues',
    original: /we\sare\scurrently\sexperiencing\sissues/i,
    translate: (_: string) => {
      return '```В настоящее время мы испытываем проблемы, которые могут повлиять на ваше приключение.```'
    },
  },
  {
    key: 'upcoming_maintenance',
    original: /servers\swill\sbe\scoming\sdown/i,
    translate: (notice: string) => {
      const startTime = dateConverter(notice)
      if (!startTime) return null

      return `**Сервера будут отключены в <t:${Math.floor(startTime.getTime() / 1000)}:t> для проведения технических работ** *(указано время вашего устройства)*`
    },
  },
]

export default new Cron({
  expression: '* * * * *',
  handler: async () => {
    const noticeResponse = await fetch('https://download.palia.com/assets/greeting/maintenance-en.txt')

    if (!noticeResponse.ok) {
      console.error('Skipped `noticeCheck` becauase response non-200:', noticeResponse.status)
      return
    }

    const notice = await noticeResponse.text()
    const cachedState = await redis.get('notice')

    if (cachedState?.toLocaleLowerCase() === notice.toLocaleLowerCase()) return

    await redis.set('notice', notice)

    // const isMaintenanceNotice = NOTICE_TRANSLATIONS.find((translation) => translation.original.test(notice))?.key === 'maintenance'
    const noticeTranslation = NOTICE_TRANSLATIONS
      .find((translation) => translation.original.test(notice))
      ?.translate(notice)

    await Promise.all([
      sendAlert({
        platform: EPlatform.TELEGRAM,
        type: EAlertType.TECHNICAL,
        title: notice ? 'Notice has been updated:' : 'Notice has been cleared',
        content: notice ? `<code>${notice}</code>` : undefined,
      }),
      sendAlert({
        platform: EPlatform.DISCORD,
        type: EAlertType.TECHNICAL,
        title: notice ? 'Объявление при входе в игру обновлено' : 'Объявление при входе в игру убрано',
        content: notice ? noticeTranslation ?? notice : undefined,
      }),
    ])
  },
})
