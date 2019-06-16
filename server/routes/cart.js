/*
TThe flow is really easy: 
you collect card details client-side,
│  you create a token, you send the token to the server and there you create a customer or
│  add the card to an existing one.
*/

import { join } from 'path'
import { readFileSync } from 'fs'
import Stripe from 'stripe'
import jwt from 'jsonwebtoken'
import { template } from 'lodash'
import Mailgun from 'mailgun-js'
const { Datastore } = require('@google-cloud/datastore')
import { isEmail, isLength, isAlpha } from 'validator'

const ds = new Datastore()




export default class Cart
{


  // TODO pass a fucked up data obj, ie, missing crates.quantity) for test
  static async checkout (ctx)
  {     
    
    // Holds order's data, such as email, shipping info, products...
    const data = ctx.request.body.orderData || null

    // JWT token lets us know if user is logged in
    const jwtToken = ctx.request.body.jwt || null

    // Strike Token that is passed if paying with a new credit card
    const stripeToken = ctx.request.body.stripeToken || null

    // Stripe (customer) ID and card ID are sent if user is paying with a stored credit card 
    const stripeId = ctx.request.body.stripeId
    const cardId = ctx.request.body.cardId    
    
    // Instantiate Stripe
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    // Instantiate Mailgun
    const emailDomain = 'mail.bnbcrate.com'
    const mailgun = Mailgun({ apiKey: process.env.MAILGUN_SECRET_KEY, domain: emailDomain })

    let userId = null
    let serverTotal = 0
    
    if (jwtToken)
    {
      let decoded= jwt.verify(jwtToken, process.env.JWT);
      userId = decoded.id      
    }   
      
    let invalidData = false   

      
    if (!stripeToken)
    {      
      if (!stripeId || !cardId)
      {
        invalidData = true
      }
    }

    if (!stripeId && cardId)
    {
      if (!stripeToken)
      {
        invalidData = true
      }
    }

    if (!data.crates.length)
    {
      invalidData = true
    }

    if (invalidData)
    {
      // TODO log
      return ctx.body = {
        result: 0,
        payload: { 
          message: 'Something went wrong. Data is missing. Please reload the page and try again.'
        }
      }
    }

    



    /**
     *
     * Client Sends: [ { id: 1, quantity: 2, price: 5.99} ]
     * We need to make sure that the ID of each crate sent by client
     * exists in the server, and that the price for that crate sent by
     * the client also matches the server. So if client sends a crate
     * of id 1 where price is $6, we need to make sure server has a crate
     * of id 1 and that its price is $6     
     */

    let productsFile = `${__dirname}/../../static/products.json`
    let products = JSON.parse(readFileSync(productsFile, 'utf8'))
    
    
    
    for (let crate of data.crates)
    {      
      let clientId = crate.id
      let clientPrice = crate.price    
      
      // Check if ID exists in the products "database"
      let [ serverCrate ]  = products.filter(c => c.id == clientId) || null

      
      // The crate id sent from client does not exist in the server.
      if (!serverCrate || clientPrice != serverCrate.price)
      {
        // TODO log
        return ctx.body = {
          result: 0,
          payload: { 
            message: 'Product mismatch. Please try again' 
          }
        }
      }
      else
      {
        // Gets passed to stripe
        serverTotal += serverCrate.price
      }
    }

    // Sanitize the data sent    
    if (!Cart._sanitizeInputs(data))
    {
      // TODO log
      return ctx.body = {
        result: 0,
        payload: { 
          message: 'Bad input.' 
        }
      }
    }


    // Validation passed.
    let email = data.email.toLowerCase()    

    // Not needed..just wasting datastore space
    delete data.shipping['id']  
        
    var charge = null
      
    try
    {
      const stripeData = {
        amount : (serverTotal * 100), // Stripe wants cents.
        currency : 'usd',
        description : `Charge for ${email}`,
        metadata: {          
          dsUserId: '',
          items: '',
          email: email,
          name: data.shipping.name,
          street: data.shipping.street,
          city: data.shipping.city,
          state: data.shipping.state,
          zip: data.shipping.zip,          
        }
      }

      if (stripeToken)
      {
        // New credit card
        stripeData.source = stripeToken.id
      }
      else
      {
        // Applying a saved credit card to a customer
        stripeData.source = cardId
        stripeData.customer = stripeId
      }

      
      charge = await stripe.charges.create(stripeData)

      // Now save in the datastore
      let datastoreOrder = await Cart._saveOrderInDB({
        email: email,
        userId: userId,
        items: data.crates,
        shipping: data.shipping,
        currency: 'usd',
        guest: data.guestName,
        total: serverTotal,
        chargeId: charge.id
      })

      
      // Now send email      
      let templateUri = `${__dirname}/../email-templates/order-confirmation.html`
      let emailTemplate = readFileSync(templateUri, 'utf-8')
      let compiled = template(emailTemplate)
      let emaildata = {
        from: `bnbcrate <orders@${emailDomain}>`,
        to: email,
        subject: 'Your bnbcrate order',
        html: compiled({
          crates: data.crates,
          address: data.shipping,
          orderId: datastoreOrder.payload.key.id 
        })
      } 

      mailgun.messages().send(emaildata, (e, body) => {
        if (e)
        {        
          // TODO log
        }        
      })
      


      return ctx.body = { result: 1 }
    }
    catch (e)
    {     
      // TODO log
      console.log(e)
      return ctx.body = {
        result: 0,
        payload: { 
          message: 'Could not charge card. Please try again' 
        }
      } 
    }

  }




  /**
   * Sanitizes all user inputs from the client.
   * Best way to know all the inputs is to take
   * a look at the client store.
   *
   * @param {Object} data: ctx.request.body
   */
  static async _sanitizeInputs(data)
  {
    const email = data.email
    //const crates = data.crates
    const shipping = data.shipping
    
    var error = []    
    
    if (!isEmail(email))
    {
      error.push('Invalid email.')
    }

    // Shipping Fields
    if (!isLength(shipping.street, {min: 1}))
    {
      error.push('Invalid shipping address.')
    }

    if (!isLength(shipping.zip, {min: 3}))
    {
      error.push('Invalid shipping zip code.')
    }

    if (!isLength(shipping.country, {min: 2, max: 2}) || shipping.country != 'us')
    {
      error.push('Invalid shipping country.')
    }  

    
    if (error.length)
    {
      return false
    }
    return true

  }


  /**
   * Saves an order into the datastore.
   * 
   * @param {String} email - buyer's email
   * @param {Int} userId - user's id, if logged in
   * @param {String} chargeId - charge ID generated by Stripe
   * @param {String} shipping - shipping address
   * @param {Object} items - Items being purchased {crate: qty}
   * @param {Int} total - total price charged
   * @param {String} currency - charge currency
   * @param {String} paymentMethod - payment method. cc or paypal
   * @param {Date} date - date and time
   * @param {String} status - order status. 'new' by default
   */
  static async _saveOrderInDB(data)
  { 
    const orderEntity = {
      key: ds.key(['Order']),
      data: [
        {
          name: 'email',
          value: data.email
        },
        {
          name: 'userId',
          value: data.userId || null
        },        
        {
          name: 'shipping',
          value: data.shipping,
          excludeFromIndexes: true
        },
        {
          name: 'items',
          value: data.items,
          excludeFromIndexes: true,
        },
        {
          name: 'total',
          value: data.total,
          excludeFromIndexes: true
        },
        {
          name: 'currency',
          value: 'usd',
          excludeFromIndexes: true
        },
        {
          name: 'guest',
          value: data.guest || null
        },
        {
          name: 'paymentMethod',
          value: 'credit card'
        },
        {
          name: 'date',
          value: new Date()
        },
        {
          name: 'status',
          value: 'new'
        },
        {
          name: 'dateShipped',
          value: null
        },
        {
          name: 'chargeId',
          value: data.chargeId
        }
      ]
    }
    
    try
    {      
      await ds.insert(orderEntity) 
     
      // Return the entity so we can use it in the email
      return { result: 1, payload: orderEntity }
    }
    catch (e)
    {
      console.log(e)
      return { result: 0 }
    }
    
    
    
  }

} // end class
