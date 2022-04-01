/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function,
    mocha/no-top-level-hooks,import/prefer-default-export */

import 'cross-fetch/polyfill'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import deepEqualInAnyOrder from 'deep-equal-in-any-order'
import Sinon, { SinonSandbox } from 'sinon'
import nock from 'nock'

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
  nock.disableNetConnect()
})

afterEach(() => {
  sandbox.restore()
  nock.cleanAll()
})

export function getSandbox(): SinonSandbox { return sandbox }
