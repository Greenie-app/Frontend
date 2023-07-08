import { setupServer } from 'msw/node'
import handlers from './handlers'

const backend = setupServer(...handlers)

export default backend
