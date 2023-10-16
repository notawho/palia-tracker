export interface ICronOptions {
  expression: string
  handler: (now: any) => any
}

export class Cron {
  // eslint-disable-next-line no-useless-constructor
  constructor (private options: ICronOptions) { }

  get expression () {
    return this.options.expression
  }

  get handler () {
    return this.options.handler
  }

  run (now: any) {
    return this.handler(now)
  }
}
