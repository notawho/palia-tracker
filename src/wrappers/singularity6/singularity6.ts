import { Color, Logger } from '@starkow/logger'
import { PaliaWrapper } from '../palia'
import * as Interfaces from './types'

const S6_ENDPOINTS: Interfaces.IS6Endpoints = {
  auth: 'https://auth.singularity6.com/api',
  live: 'https://live.singularity6.com',
}

const S6_CONSTANTS: Interfaces.IS6Constants = {
  applicationId: '3702f178-2cf6-4b03-8b28-2ade8b922d82',
  authToken: 'b9ws__s7PzO_w7fUUFfjTfQB2akD_XquoIs1MVNhm-Qcev_lF8Dd3H_P',
}

class S6Error extends Error {
  constructor (message: string) {
    super(message)

    this.name = this.constructor.name
  }
}

export class S6HeaderBuilder {
  static buildAuthHeaders (options: Interfaces.IS6HeaderBuilderOptions) {
    if (options.versions === undefined || options.constants === undefined) {
      throw new S6Error('`constants` and `versions` fields are required')
    }

    return {
      'User-Agent': 'X-UnrealEngine-Agent',
      'X-Client-Version': options.versions.patch,
      Authorization: options.constants.authToken,
    }
  }

  static buildLiveHeaders (options: Interfaces.IS6HeaderBuilderOptions) {
    if (!options.versions || !options.constants) {
      throw new S6Error('`constants` and `versions` fields are required')
    }

    return {
      'User-Agent': `Palia/++Valeria+Release_${options.versions.baseline}-CL-134388 Windows/10.0.19045.1.768.64bit`,
      'X-Client-Version': options.versions.patch,
      ...options.loginData
        ? {
          'X-Session-Id': 'GameSession',
          'X-Authenticated-Character': options.loginData.user.id,
          Authorization: `Bearer ${options.loginData.token}`,
        }
        : {},
    }
  }
}

export class S6Wrapper {
  private logger = Logger.create('wrappers:s6', Color.Green)
  private _loginData: Interfaces.IS6LoginResponse | undefined = undefined
  private _versions: Interfaces.IS6Versions | undefined = undefined

  constructor (private options: Interfaces.IS6Options) {
    if (options.email === undefined || options.password === undefined) {
      throw new S6Error('`email` and `password` is required options')
    }
  }

  get endpoints () {
    return this.options.endpoints !== undefined ? this.options.endpoints : S6_ENDPOINTS
  }

  get constants () {
    return this.options.constants !== undefined ? this.options.constants : S6_CONSTANTS
  }

  get versions () {
    return this._versions
  }

  get loginData () {
    return this._loginData
  }

  set versions (value: Interfaces.IS6Versions | undefined) {
    this._versions = value
  }

  set loginData (value: Interfaces.IS6LoginResponse | undefined) {
    this._loginData = value
  }

  private async getVersions (): Promise<Interfaces.IS6Versions | undefined> {
    const patchManifest = await PaliaWrapper.getPatchManifest().then(r => Object.entries(r!))

    if (!patchManifest.length) return

    const latestBaseline = patchManifest.filter(([_, patchData]) => patchData.BaseLineVer).at(-1)!
    const latestPatch = patchManifest.filter(([_, patchData]) => !patchData.BaseLineVer).at(-1)!

    this.versions = {
      baseline: latestBaseline[0],
      patch: latestPatch[0],
    }

    return this.versions
  }

  async login (): Promise<Interfaces.IS6LoginResponse> {
    try {
      if (!this.versions) {
        await this.getVersions()
      }

      const body = {
        applicationId: this.constants.applicationId,
        loginId: this.options.email,
        password: this.options.password,
      }

      const response = await fetch(`${this.endpoints.auth}/login`, {
        headers: {
          'Content-Type': 'application/json',
          ...S6HeaderBuilder.buildAuthHeaders({ constants: this.constants, versions: this.versions }),
        },
        body: JSON.stringify(body),
        method: 'POST',
      })

      if (!response.ok) {
        throw new S6Error(`Unable to login, status code: ${response.status}`)
      }

      const json: Interfaces.IS6LoginResponse = await response.json()

      if (!json.token) {
        throw new Error('`token` is not presented in `login` response')
      }

      this.loginData = json
      return json
    } catch (error: any) {
      throw new S6Error(error)
    }
  }

  async authValidate (): Promise<boolean> {
    if (!this.loginData) throw new S6Error('Trying to execute method while unauthorized')

    try {
      const response = await fetch(`${this.endpoints.live}/auth-proxy/api/v1/auth/validate`, {
        headers: S6HeaderBuilder.buildLiveHeaders({ constants: this.constants, versions: this.versions, loginData: this.loginData }),
      })

      return response.status === 200
    } catch (error: any) {
      throw new S6Error(error)
    }
  }

  async getCharacters (characterId?: string): Promise<Interfaces.IS6Character[]> {
    if (!this.loginData) throw new S6Error('Trying to execute method while unauthorized')

    try {
      const response = await fetch(`${this.endpoints.live}/character/api/v2/characters/${characterId !== undefined ? characterId : this.loginData.user.id}`, {
        headers: S6HeaderBuilder.buildLiveHeaders({ constants: this.constants, versions: this.versions, loginData: this.loginData }),
      })

      if (response.status === 401) {
        this.logger.warn('can\'t get characters because server in maintenance')
        return []
      }

      const json: Interfaces.IS6Character[] = await response.json()
      return json
    } catch (error: any) {
      throw new S6Error(error)
    }
  }

  async getFriends (): Promise<Interfaces.IS6FriendListResponse> {
    if (!this.loginData) throw new S6Error('Trying to execute method while unauthorized')

    try {
      const response = await fetch(`${this.endpoints.live}/friend/api/v1/friends/${this.loginData.user.id}`, {
        headers: S6HeaderBuilder.buildLiveHeaders({ constants: this.constants, versions: this.versions, loginData: this.loginData }),
      })

      const json: Interfaces.IS6FriendListResponse = await response.json()
      return json
    } catch (error: any) {
      throw new S6Error(error)
    }
  }

  async getPresenceStatus (): Promise<Interfaces.IS6PresenceStatusResponse> {
    if (!this.loginData) throw new S6Error('Trying to execute method while unauthorized')

    try {
      const response = await fetch(`${this.endpoints.live}/presence/api/v2/status/${this.loginData.user.id}`, {
        headers: S6HeaderBuilder.buildLiveHeaders({ constants: this.constants, versions: this.versions, loginData: this.loginData }),
      })

      if (!response.ok) {
        this.logger.warn('non-ok status for `getPresenceStatus`:', response.status)
      }

      const json: Interfaces.IS6PresenceStatusResponse = await response.json()
      return json
    } catch (error: any) {
      throw new S6Error(error)
    }
  }

  async joinServer (characterId: string, clientBuild: string, serverType: string = 'DA_ExpPkg_Housing') {
    if (!this.loginData) throw new S6Error('Trying to execute method while unauthorized')

    try {
      const response = await fetch(`${this.endpoints.live}/matchmaker/api/v1/join`, {
        headers: {
          'Content-Type': 'application/json',
          ...S6HeaderBuilder.buildLiveHeaders({ constants: this.constants, versions: this.versions, loginData: this.loginData }),
        },
        body: JSON.stringify({
          player: {
            account_id: this.loginData.user.id,
            character_id: characterId,
          },
          server: {
            server_type: serverType,
            version: clientBuild,
          },
        }),
        method: 'POST',
      })

      const json = await response.json()
      return json
    } catch (error: any) {
      throw new S6Error(error)
    }
  }
}
