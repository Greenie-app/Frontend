import {
  LogfileJSON, PassJSONDown, SquadronJSONDown
} from '@/store/coding'

declare module '*.json' {
  const value: unknown
  export = value
}

declare module 'logfile.json' {
  const value: LogfileJSON
  export = value
}

declare module 'logfiles.json' {
  const value: Array<LogfileJSON>
  export = value
}

declare module 'pass.json' {
  const value: PassJSONDown
  export = value
}

declare module 'passes.json' {
  const value: Array<PassJSONDown>
  export = value
}

declare module 'squadron.json' {
  const value: SquadronJSONDown
  export = value
}

declare module 'squadrons.json' {
  const value: Array<SquadronJSONDown>
  export = value
}
