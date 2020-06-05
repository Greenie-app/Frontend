import { default as prodSecrets } from '@/config/secrets/secrets.production'
import { default as devSecrets } from '@/config/secrets/secrets.development'
import { default as testSecrets } from '@/config/secrets/secrets.test'
import { Secrets } from '@/config/secrets/type'

// eslint-disable-next-line import/no-mutable-exports
let secrets: Secrets
switch (process.env.NODE_ENV) {
  case 'production':
    secrets = prodSecrets
    break
  case 'test':
    secrets = testSecrets
    break
  default:
    secrets = devSecrets
    break
}
export default secrets
