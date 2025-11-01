declare module 'simple-rcon' {
  interface RconOptions {
    host: string
    port: number
    password: string
    timeout?: number
  }

  class Rcon {
    constructor(options: RconOptions)
    connect(): Promise<void>
    exec(command: string): Promise<any>
    close(): Promise<void>
  }

  export = Rcon
}

