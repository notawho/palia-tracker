export interface IBaseManifest {
  version: string
  url: string
}

export interface IPaliaLauncherManifest extends IBaseManifest {

}

export interface IPaliaGameManifest extends IBaseManifest {
  manifest_url: string
  patch_method: string // @note: known: 'pak'
  entry: string
}

export interface IPaliaPatchFile {
  URL: string
  Hash: string
}

export interface IPaliaPatchManifest {
  [key: string]: {
    BaseLineVer: boolean
    Files: IPaliaPatchFile[]
  }
}

export interface IPaliaGameConfigEntry {
  name: string
  version: string
  valid_at_timestamp: number
}

export interface IPaliaGameConfigManifest {
  entries: IPaliaGameConfigEntry[]
  polling_interval: number
}

export class PaliaWrapper {
  static async getLauncherManifest (): Promise<IPaliaLauncherManifest | null> {
    try {
      const response = await fetch('https://update.palia.com/manifest/PaliaLauncher.json').then(r => r.json())

      return response as IPaliaLauncherManifest
    } catch (error) {
      return null
    }
  }

  static async getGameManifest (): Promise<IPaliaGameManifest | null> {
    try {
      const response = await fetch('https://update.palia.com/manifest/Palia.json').then(r => r.json())

      return response as IPaliaGameManifest
    } catch (error) {
      return null
    }
  }

  static async getPatchManifest (): Promise<IPaliaPatchManifest | null> {
    try {
      const response = await fetch('https://update.palia.com/manifest/PatchManifest.json', {
        headers: {
          'User-Agent': 'Palia/++Valeria+Release_0.165.0-CL-136154 Windows/10.0.19045.1.768.64bit',
        },
      }).then(r => r.json())

      return response as IPaliaPatchManifest
    } catch (error) {
      return null
    }
  }

  static async getGameConfigManifest (): Promise<IPaliaGameConfigManifest | null> {
    try {
      const response = await fetch('https://gameconfig.singularity6.com/manifest.json', {
        headers: {
          'User-Agent': 'Palia/++Valeria+Release_0.165.0-CL-136154 Windows/10.0.19045.1.768.64bit',
        },
      }).then(r => r.json())

      return response as IPaliaGameConfigManifest
    } catch (error) {
      return null
    }
  }
}
