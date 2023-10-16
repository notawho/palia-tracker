import gameConfigCheck from './gameConfigCheck'
import launcherCheck from './launcherCheck'
import maintenanceCheck from './maintenanceCheck'
import noticeCheck from './noticeCheck'
import patchCheck from './patchCheck'
import serverDegradationCheck from './serverDegradationCheck'
import versionCheck from './versionCheck'

export default [
  versionCheck,
  patchCheck,
  launcherCheck,
  noticeCheck,
  maintenanceCheck,
  gameConfigCheck,
  // serverDegradationCheck,
]
