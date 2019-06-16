import Koa from 'koa'

import cors from 'kcors'
import { readFileSync } from 'fs'
import Koabody  from 'koa-body'
import Router from 'koa-router'
import koaJwt from 'koa-jwt'
import * as api from './routes'
import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config.js'
const app = new Koa()
const HOST = process.env.HOST || `0.0.0.0`
const PORT = process.env.PORT || 3000


// Import and Set Nuxt.js options
nuxtConfig.dev = !(app.env === 'production')



async function start() {  

  const nuxt = new Nuxt(nuxtConfig)

  // Dev purposes
  if (nuxtConfig.dev) {    
    const builder = new Builder(nuxt)
    await builder.build()
  }

  const renderNuxt = createKoaMiddleware (nuxt)
  const router = new Router({ prefix: '/api' })
  const koabody = new Koabody({ multipart: false })

  // If `api` is in the url, it's an xhr request.
  app.use(async (ctx, next) => {    
    ctx.state.isXhr = (/\/api/i.test(ctx.request.url)) ? true : false    
    await next()
  })

  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (error) {      
      // TODO log
      console.log(error)      
      ctx.status = 403
      
      // expose error to nuxt
      // • used by middleware/handle-server-errors
      ctx.req.error = 402
      try {
        
        // still call nuxt middleware
        await renderNuxt(ctx)
      } catch (nuxtError) {
        // we want to make that ANY errors will be catch here
        
        ctx.body = `nuxt error`
      }
    }
  }) 
  
  
  

  // Don't really know where to put this, so it goes here
  router.get('/products', async (ctx, next) => {    
    if (ctx.state.isXhr) {
      let file = readFileSync(`${__dirname}/../static/products.json`)
      let products = JSON.parse(file) 
      return ctx.body = { products }
    }    
  })

  /*********************************************
   * ROUTES
   ********************************************/  
  router.post('/cart/checkout', koabody, api.cart.checkout)
  //router.post('/contact', koabody, api.contact.contact)
  router.post('/user/register', koabody, api.user.register)

  
  
  app.use(cors())
  app.use(router.routes())
  app.use(router.allowedMethods())  
  app.use(renderNuxt)  

  
  app.listen(PORT, HOST, function koaInitEnd() {
    console.log(
      `server is listening at ${HOST}:${PORT}`,
      `on mode ${app.env}`,
    )
  })

}

start()


/**
 * Koa nuxt middleware.
 * https://github.com/Hiswe/koa-nuxt-example/blob/master/server/index.js
 */
function createKoaMiddleware(nuxt) {
  return function renderNuxt(ctx) {
      // koa defaults to 404 when it sees that status is unset
      ctx.status = 200;
      // Mark request as handled for Koa
      ctx.respond = false;
      return new Promise(function (resolve, reject) {
          ctx.res.on('close', resolve);
          ctx.res.on('finish', resolve);
          nuxt.render(ctx.req, ctx.res, function nuxtRenderCallback(renderPromise) {
              // nuxt.render passes a rejected promise into callback on error.
              renderPromise.then(resolve)["catch"](reject);
          });
      });
  };
}