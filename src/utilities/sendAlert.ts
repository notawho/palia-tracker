import { stripIndents } from 'common-tags'
import config from '../config'
import telegram from '../telegram'

export enum EPlatform {
  TELEGRAM = 'telegram',
  DISCORD = 'discord'
}

export enum EAlertType {
  INCIDENT = 'incident',
  INCIDENT_RESOLVED = 'incident_resolved',
  PATCH = 'patch',
  TECHNICAL = 'technical'
}

export interface IAlertOptions {
  title: string
  content?: string
  type: EAlertType,
  platform: EPlatform
}

const DISCORD_EMBED_COLOR_MAPPING = {
  [EAlertType.INCIDENT]: 'FF0000',
  [EAlertType.INCIDENT_RESOLVED]: '90EE90',
  [EAlertType.PATCH]: '00CED1',
  [EAlertType.TECHNICAL]: '808080',
}

const TELEGRAM_EMOJI_MAPPING = {
  [EAlertType.INCIDENT]: '⚠️',
  [EAlertType.INCIDENT_RESOLVED]: '✅',
  [EAlertType.PATCH]: '🗂',
  [EAlertType.TECHNICAL]: '🛠',
}

export const sendAlert = async (options: IAlertOptions) => {
  switch (options.platform) {
  case EPlatform.DISCORD: {
    if (!config.discord.webhookURL) return

    const payload = {
      embeds: [
        {
          title: options.title,
          description: options.content,
          footer: {
            text: 'С любовью и багами для Palia RU от @notawho',
          },
          color: parseInt(DISCORD_EMBED_COLOR_MAPPING[options.type], 16),
        },
      ],
    }

    await fetch(config.discord.webhookURL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }
    break
  case EPlatform.TELEGRAM: {
    if (!config.telegram.chatId) return

    const message = stripIndents`
      ${options.title ? `<b>${TELEGRAM_EMOJI_MAPPING[options.type]} ${options.title}</b>` : ''}
      ${options.content ?? ''}
    `

    await telegram.api.sendMessage({
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_notification: ![EAlertType.INCIDENT, EAlertType.INCIDENT_RESOLVED].includes(options.type),
      disable_web_page_preview: true,
    })
  }
    break
  }
}
