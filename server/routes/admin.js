/*
TThe flow is really easy: 
you collect card details client-side,
│  you create a token, you send the token to the server and there you create a customer or
│  add the card to an existing one.
*/


//import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
const { Datastore } = require('@google-cloud/datastore')

const ds = new Datastore()
const stripe = Stripe(process.env.STRIPE)

export default class Admin
{
 
  /**
   * Grab all orders
   */
  static async orders (ctx)
  {     
    const [, user] = await Admin._getUserEntity(ctx)    

    // User doesn't exist
    if (!user || user.level != 1)
    {
      return ctx.body = {
        result: 0,
        code: 'NO_USER'
      }
    }  
    
    const query = ds.createQuery('Order')
    if (ctx.request.query.status != 'all')
    {
      query.filter('status', '=', ctx.request.query.status || 'new')
    }

    try
    {
      let results = await ds.runQuery(query)
      let orders = results[0].map(o => {
        
        let items = []
        for (let item of o.items)
        {          
          items.push( {quantity: item.quantity, name: item.name} )
        }
        
        // Format our response to client
        return {
          total: o.total,
          id: o[ds.KEY].name,
          status: o.status,
          guest: o.guest,
          items,            
          date: Date(o.date).toString().split(' ').slice(1, 4).join(' '),
          address: `${o.shippingAddress.street}, ${o.shippingAddress.city}`
        }
      })
      
      return ctx.body = {
        result: 1,
        payload: {
          orders, 
        }        
      }  

    }
    catch (e)
    {

    }  

    return ctx.body = {
      result: 1,
      payload: {
        
      }
    }    
  }



  /**
   * Updates the status of an order.
   * 
   * @param {Obj} ctx koa ctx object
   */
  static async updateOrderStatus (ctx)
  {
    const [, user] = await Admin._getUserEntity(ctx)    
    
    if (!user || user.level != 1)
    {
      return ctx.body = {
        result: 0,
        code: 'NO_USER'
      }
    }
    
    const id = ctx.request.body.id
    const status = ctx.request.body.status
    
    try
    {
      let orderKey = ds.key(['Order', id])
      let order = await ds.get(orderKey)
      
      order[0].status = status
      if (status == 'shipped')
      {
        order[0].dateShipped = Date.now()
      }

      let entity = { key: orderKey, data: order[0] }
      await ds.update(entity)
      return ctx.body = {
        result: 1,
        payload: {
          message: 'Status updated to ' + status
        }
      }
    }
    catch (e)
    {
      console.log(e)
      return ctx.body = {
        result: 0,
        payload: {
          message: 'Could not update status'
        }
      }
    }
  }


  static async _getUserEntity (ctx)
  {
    if (!ctx.state.user)
    {
      return [null, null]
    }
    
    let userKey = ds.key(['User', ctx.state.user.id])    
    let user = await ds.get(userKey)

    if (user[0] == undefined || user[0].level != 1)
    { 
      return [null, null]
    }
    else
    {
      return [userKey, user[0]]
    }
  }
}
