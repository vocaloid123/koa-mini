const http = require('http')

function compose (middlewares) {
  return ctx => {
    const dispatch = (i) => {
      const fn = middlewares[i]
      if (i === middlewares.length) {
        return
      }
      return fn(ctx, () => dispatch(i+1))
    }
    return dispatch(0)
  }
}

class Application {
  constructor () {
    this.cbs = []
  }

  listen (...args) {
    const server = http.createServer(async (req, res) => {
      const ctx = new Context(req, res)
      const fn = compose(this.cbs)
      await fn(ctx)
      ctx.res.end(ctx.body)
    })
    server.listen(...args)
  }

  use (cb) {
    this.cbs.push(cb)
  }
}

class Context {
  constructor (req, res) {
    this.req = req
    this.res = res
  }
}

// Example

const app = new Application()

app.use(async (ctx, next) => {
  console.log('Middleware 1 Start')
  await next()
  console.log('Middleware 1 End')
})

app.use(async (ctx, next) => {
  console.log('Middleware 2 Start')
  await next()
  console.log('Middleware 2 End')

  ctx.body = 'hello, world'
})

app.listen(7000)
