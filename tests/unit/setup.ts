 

import { beforeEach, afterEach } from 'vitest'
import backend from './backend'

beforeEach(() => {
  backend.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  backend.resetHandlers()
  backend.close()
})
