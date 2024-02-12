import * as Nock from 'nock'

export import NockScope = Nock.Scope
export type Callback = (nock: NockScope) => unknown

export default function nock(host?: string, options?: Callback | Nock.Options, cb?: Callback) {
  if (host === undefined) throw new Error('host is undefined')
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  if (cb === undefined) throw new Error('callback is undefined')

  // eslint-disable-next-line unicorn/prefer-module
  const nock: typeof Nock = require('nock')
  const interceptor = nock(host, options)
  return {
    async run(ctx: {nock: number}) {
      ctx.nock = ctx.nock || 0
      await cb!(interceptor)
      ctx.nock++
    },
    // eslint-disable-next-line perfectionist/sort-objects
    finally(ctx: {error?: Error; nock: number}) {
      if (!ctx.error) interceptor.done()
      ctx.nock--
      if (ctx.nock === 0) nock.cleanAll()
    },
  }
}

