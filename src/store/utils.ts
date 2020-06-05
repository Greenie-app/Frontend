import { isUndefined } from 'lodash-es'
import { Err, Ok, Result } from 'ts-results'
import { APIFailure, APIResponse, Errors } from '@/store/types'

export const FROZEN_MODULES = ['auth']

async function returnJSONErrorsOrThrow(result: APIFailure): Promise<Errors> {
  if (result.response.status === 422) {
    if (isUndefined(result.body.errors)) throw new Error('Empty HTTP body')
    return result.body.errors
  }
  throw new Error(`Invalid HTTP response: ${result.response.status}`)
}

async function parseAndReturnJSONErrorsOrThrow(response: Response): Promise<Errors> {
  if (response.status === 422) {
    return (await response.json()).errors
  }
  throw new Error(`Invalid HTTP response: ${response.status}`)
}

async function parseAndReturnJSONErrorOrThrow(
  response: Response,
  parseErrorStatus: number[] = [422]
): Promise<string> {
  if (parseErrorStatus.includes(response.status)) {
    return (await response.json()).error
  }
  throw new Error(`Invalid HTTP response: ${response.status}`)
}

export function loadResponseBodyOrThrowError<T>(result: APIResponse<T>): T {
  if (result.ok) {
    if (isUndefined(result.val.body)) {
      throw new Error('Empty HTTP body')
    } else {
      return result.val.body
    }
  }
  throw new Error(`Invalid HTTP response: ${result.val.response.status}`)
}

export async function loadResponseBodyOrReturnErrors<T>(result: APIResponse<T>):
  Promise<Result<T, Errors>> {
  if (result.ok) {
    if (isUndefined(result.val.body)) {
      throw new Error('Empty HTTP body')
    } else {
      return new Ok(result.val.body)
    }
  }
  return new Err(await returnJSONErrorsOrThrow(result.val))
}

export async function ignoreResponseBodyOrReturnErrors(response: Response):
  Promise<Result<void, Errors>> {
  if (response.ok) return new Ok(undefined)
  return new Err(await parseAndReturnJSONErrorsOrThrow(response))
}

export async function ignoreResponseBodyOrReturnError(
  response: Response,
  parseErrorStatus: number[] = [422]
):
  Promise<Result<void, string>> {
  if (response.ok) return new Ok(undefined)
  return new Err(await parseAndReturnJSONErrorOrThrow(response, parseErrorStatus))
}

export async function ignoreResponseBodyOrThrowError(result: APIResponse<void>): Promise<void> {
  if (result.ok) return
  throw new Error(`Invalid HTTP response: ${result.val.response.status}`)
}
