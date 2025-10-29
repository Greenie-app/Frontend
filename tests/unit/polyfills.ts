// Polyfill localStorage for MSW before anything imports it
// jsdom should provide this, but MSW is having issues accessing it

// Create a proper storage mock
const createStorage = (): Storage => {
  const store: Record<string, string> = {}

  return {
    getItem(key: string): string | null {
      return store[key] || null
    },
    setItem(key: string, value: string): void {
      store[key] = value.toString()
    },
    removeItem(key: string): void {
      delete store[key]
    },
    clear(): void {
      Object.keys(store).forEach(key => delete store[key])
    },
    key(index: number): string | null {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length(): number {
      return Object.keys(store).length
    }
  }
}

// Ensure localStorage exists before MSW imports
if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    writable: true,
    configurable: true
  })
}

// Also set it on global for Node environment
if (typeof global !== 'undefined' && (!global.localStorage || typeof global.localStorage.getItem !== 'function')) {
  Object.defineProperty(global, 'localStorage', {
    value: createStorage(),
    writable: true,
    configurable: true
  })
}
