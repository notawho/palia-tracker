import { Telegram } from 'puregram'
import config from './config'

export default new Telegram({ token: config.telegram.token })
