export interface IS6Membership {
  data: any
  groupId: string
  id: string
  insertInstant: number
}

export interface IS6Registration {
  id: string
  applicationId: string
  data: any
  insertInstant: number
  lastLoginInstant: number
  lastUpdateInstant: number
  preferredLanguages: string[]
  roles: string[]
  tokens: any
  usernameStatus: string
  verified: boolean
}

export interface IS6UserData {
  country: string
  kws: {
    is_graduated: boolean
  }
  subscribed: boolean
}

export interface IS6User {
  id: string
  active: boolean
  birthDate: string
  breachedPasswordLastCheckedInstant: number
  breachedPasswordStatus: string
  connectorId: string
  data: IS6UserData
  email: string
  insertInstant: number
  lastLoginInstant: number
  lastUpdateInstant: number
  membership: IS6Membership
  passwordChangeRequired: boolean
  passwordLastUpdateInstant: number
  preferredLanguages: string[]
  registrations: IS6Registration[]
  tenantId: string
  twoFactor: {
    methods: any[]
    recoveryCodes: any[]
  }
  uniqueUsername: string
  username: string
  usernameStatus: string
  verified: boolean
}

export interface IS6LoginResponse {
  token: string
  refreshToken: string
  refreshTokenId: string
  tokenExpirationInstant: number
  user: IS6User
}

export interface IS6CustomizationEntry<T = {[key: string]: string}> {
  id: string
  variant: T
}

export interface IS6CustomizationHairStyle {
  EyebrowColor: string
  HairTipColor: string
  HairTipMask: string
  HairBaseColor: string
}

export interface IS6CustomizationLegs {
  LegsBaseColor: string
}

export interface IS6CustomizationTorso {
  LegsBaseColor: string
}

export interface IS6CharacterCustomization {
  Head: IS6CustomizationEntry
  AnimSet: IS6CustomizationEntry
  HairStyle: IS6CustomizationEntry<IS6CustomizationHairStyle>
  SkinTone: IS6CustomizationEntry
  Eyes: IS6CustomizationEntry
  FacialHair: IS6CustomizationEntry
  Voice: IS6CustomizationEntry
  FaceTattoo: IS6CustomizationEntry
  BodyComplexion: IS6CustomizationEntry
  FaceMask: IS6CustomizationEntry
  BodyTattoo: IS6CustomizationEntry
  FaceComplexion: IS6CustomizationEntry
}

export interface IS6LoadoutCustomization {
  Makeup: IS6CustomizationEntry
  Hat: IS6CustomizationEntry
  Pet: IS6CustomizationEntry
  Legs: IS6CustomizationEntry<IS6CustomizationLegs>
  Glider: IS6CustomizationEntry
  Torso: IS6CustomizationEntry<IS6CustomizationTorso>
}

export interface IS6Loadout {
  loadout_id: string
  name: string
  customization_options: IS6LoadoutCustomization
}

export interface IS6Character {
  account_id: string
  character_id: string
  character_name: {
    first: string
    last: string
  }
  body_type: number
  customization_options: IS6CharacterCustomization
  current_loadout: string
  loadouts: IS6Loadout[]
}

export interface IS6PresenceStatus {
  account_id: string
  character_id: string
  status: string
  zone: string
}

export interface IS6PresenceStatusResponse {
  statuses: IS6PresenceStatus[]
}

export interface IS6FriendListResponse {
  account_ids: string[]
}

export interface IS6Endpoints {
  auth: string
  live: string
}

export interface IS6Constants {
  applicationId: string
  authToken: string
}

export interface IS6Versions {
  baseline: string
  patch: string
}

export interface IS6HeaderBuilderOptions {
  constants?: IS6Constants
  versions?: IS6Versions
  loginData?: IS6LoginResponse
}

export interface IS6Options {
  email?: string
  password?: string
  endpoints?: IS6Endpoints
  constants?: IS6Constants
}
