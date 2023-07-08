/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function,
    mocha/no-top-level-hooks,import/prefer-default-export */

import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import deepEqualInAnyOrder from 'deep-equal-in-any-order'
import Sinon, { SinonSandbox } from 'sinon'
import backend from './backend'

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(deepEqualInAnyOrder)

const localStorage = {
  length: 0,
  clear(): void {},
  getItem(key: string): string | null { return null },
  key(index: number): string | null { return null },
  removeItem(key: string): void {},
  setItem(key: string, value: string): void {}
}

let sandbox: SinonSandbox

beforeEach(() => {
  sandbox = Sinon.createSandbox()
  sandbox.replaceGetter(window, 'localStorage', () => localStorage)

  backend.listen()
})

afterEach(() => {
  sandbox.restore()
  backend.resetHandlers()
})

after(() => backend.close())

// eslint-disable-next-line mocha/no-exports
export function getSandbox(): SinonSandbox { return sandbox }
