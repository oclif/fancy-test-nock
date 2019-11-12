import * as Nock from 'nock'

export import NockScope = Nock.Scope
export type Callback = (nock: NockScope) => any

export default function nock(host?: string, options?: Callback | Nock.Options, cb?: Callback) {
  if (host === undefined) throw new Error('host is undefined')
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  if (cb === undefined) throw new Error('callback is undefined')

  const nock: typeof Nock = require('nock')
  const intercepter = nock(host, options)
  return {
    async run(ctx: {nock: number}) {
      ctx.nock = ctx.nock || 0
      await cb!(intercepter)
      ctx.nock++
    },
    finally(ctx: {error?: Error; nock: number}) {
      if (!ctx.error) intercepter.done()
      ctx.nock--
      if (ctx.nock === 0) nock.cleanAll()
    },
  }
}

