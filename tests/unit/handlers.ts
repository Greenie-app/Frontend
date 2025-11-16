import {
  DefaultBodyType, http, HttpResponse, PathParams
} from 'msw'
import squadronsJSON from '../fixtures/squadrons.json'
import squadronJSON from '../fixtures/squadron.json'
import logfilesJSON from '../fixtures/logfiles.json'
import logfileJSON from '../fixtures/logfile.json'
import passesJSON from '../fixtures/passes.json'
import passJSON from '../fixtures/pass.json'

function paginate<T>(url: string, json: T[]): [T[], string] {
  const uri = new URL(url)
  const pageQuery = uri.searchParams.get('page')
  const page = pageQuery ? Number.parseInt(pageQuery, 10) : 1
  const first = (page - 1) * 10
  const last = first + 10

  if (first < json.length) {
    return [json.slice(first, last), `${uri.pathname}?page=${page + 1}`]
  }
  return [json.slice(first, last), '']
}

interface LoginJSONUp {
  squadron: {
    username: string
    password: string
    remember_me: boolean
  }
}

const handlers = [
  http.post<PathParams, LoginJSONUp, DefaultBodyType>('http://localhost:5100/login.json', async ({ request }) => {
    const body = await request.json()
    if (body.squadron.username === 'test' && body.squadron.password === 'user') {
      return HttpResponse.json({ success: true }, { headers: { Authorization: 'Bearer foobar' } })
    }
    return HttpResponse.json({ success: false }, { status: 401 })
  }),

  http.delete('http://localhost:5100/logout.json', () => HttpResponse.json({ success: true })),

  http.get('http://localhost:5100/squadrons.json', ({ request }) => {
    const [body, nextPage] = paginate(request.url, squadronsJSON)
    return HttpResponse.json(body, { headers: { 'X-Next-Page': nextPage } })
  }),

  http.post('http://localhost:5100/squadrons.json', () => HttpResponse.json(
    squadronJSON,
    { status: 201, headers: { Authorization: 'Bearer foobar' } }
  )),

  http.get('http://localhost:5100/squadron/logfiles.json', ({ request }) => {
    const [body, nextPage] = paginate(request.url, logfilesJSON)
    return HttpResponse.json(body, { headers: { 'X-Next-Page': nextPage } })
  }),

  http.post('http://localhost:5100/squadron/logfiles.json', () => HttpResponse.json(
    logfileJSON,
    { status: 201 }
  )),

  http.get('http://localhost:5100/squadrons/72nd.json', () => HttpResponse.json(squadronJSON)),

  http.get('http://localhost:5100/squadrons/notfound.json', () => HttpResponse.json(
    { error: 'not_found' },
    { status: 404 }
  )),

  http.put('http://localhost:5100/squadron.json', () => HttpResponse.json(squadronJSON)),

  http.get('http://localhost:5100/squadrons/72nd/passes.json', () => HttpResponse.json({
    passes: passesJSON,
    boarding_rate: 0.5
  })),

  http.post('http://localhost:5100/squadron/passes.json', () => HttpResponse.json(
    passJSON,
    { status: 201 }
  )),

  http.get('http://localhost:5100/squadron/passes/12.json', () => HttpResponse.json(passJSON)),

  http.put('http://localhost:5100/squadron/passes/12.json', () => HttpResponse.json(passJSON)),

  http.delete('http://localhost:5100/squadron/passes/12.json', () => HttpResponse.json(
    { ...passJSON, 'destroyed?': true }
  )),

  http.put('http://localhost:5100/squadron/pilots/Stretch%20%7C%2055FS.json', () => HttpResponse.json({ ok: true }))
]

export default handlers
