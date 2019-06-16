/*
The flow is really easy: 
| you collect card details client-side,
│  you create a token, you send the token to the server and there 
|  you create a customer or add the card to an existing one.
*/


import bcrypt from 'bcrypt'
import crypto from 'crypto'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import Stripe from 'stripe'
import Mailgun from 'mailgun-js'
import { isEqual } from 'lodash'
const { Datastore } = require('@google-cloud/datastore')
import validation from '../settings/validation'
import { isEmail, isLength, isAlpha } from 'validator'


const ds = new Datastore()




export default class User
{


  /*********************************************************
   * ADDRESSES
   *********************************************************/

  /**
   * Get a user's list of addresses.
   */

  static async getAddresses (ctx)
  {     
    const [, user] = await User._getUserEntity(ctx)    
    if (!user)
    {      
      return ctx.body = {
        result: 0,        
        code: 'NO_USER',
        payload: {
          message: 'no user'
        } 
      }
    }

    return ctx.body = {
      result: 1,
      payload: {
        addresses: user.addresses || [] 
      }
    }    
  }



  /**
   * Add an address to the user's address list.
   */

  static async addAddress (ctx)
  {   
    const street = ctx.request.body.street
    const city = ctx.request.body.city
    const state = ctx.request.body.state
    const zip = ctx.request.body.zip
    const country = ctx.request.body.country

    if ( ! isLength(street, { min: 2 })
      || ! isLength(city, { min: 1 })
      || ! isLength(state, { min: 2, max: 2 })
      || ! isAlpha(state)
      || ! /[0-9a-zA-Z]+/i.test(zip)
    )
    {
      return ctx.body = 'invalid form args'
    }
    
    
    const [userKey, user] = await User._getUserEntity(ctx)
    
    if (!user)
    {
      return ctx.body = { result: 0, 
        payload: {
          message: 'no user'
        }      
      }
    }

    var addresses = user.addresses      
    
    const newAddress = {
      street,
      city,
      state,
      zip,
      country    
    }

    for (let address of addresses)
    {
      // Client  will have an id, Server one won't.
      // So remove ID for comparison
      let id = address.id
      delete address.id      

      if (isEqual(address, newAddress))
      {
        return ctx.body = {
          result: 0,
          payload: {
            message: 'This address is already in your list.'
          }
        }        
      }

      // Ok, add the id back, lol.
      address.id = id
    }

    newAddress.id = Date.now(),
    addresses.push( newAddress )

    const entity = { key: userKey, data: user }
    
    try
    {
      await ds.update(entity)
      return ctx.body = {
        result: 1,
        payload: {
          message: 'Address added to your list.',
          address: newAddress
        }
      }
    }
    catch (e)
    {
      ctx.body = { result: 0, payload: 'Server error. Please try again' }
    }
  }



  /**
   * Updates a user's address.
   * We use an id to identify which address
   * to update.
   */

  static async updateAddress (ctx)
  {

    // 1. Get user entity
    const [userKey, user] = await User._getUserEntity(ctx)


    // 2. Loop addresses, comparing IDs
    if (user)
    {
      // Make sure address id sent in body exists in an address in user's list
      var exists = !!user.shippingAddresses.filter( o => o.id == ctx.request.body.address.id )     
      
      if (exists)
      {
        // Remove the address to update from user's list. (we're replacing it)
        user.shippingAddresses = user.shippingAddresses.filter(o => o.id != ctx.request.body.address.id)        
        user.shippingAddresses.push( ctx.request.body.address )
      }
      else
      {
        return ctx.body = {
          result: 0, payload: {
            message: 'Address updated!'
          }        
        }
      }

      const entity = { key: userKey, data: user }

      try
      {
        await ds.update(entity)
        return ctx.body = { result: 1, payload: 'Address updated!' }        
      }
      catch (e)
      {
        //TODO log e
        return ctx.body = {
          result: 0, payload: {
            message: 'Could not update address'
          }
        }
      }


    }
    else
    {
      // Error. No user found. TODO log
      return ctx.body = {
        result: 'error',
        payload: {
          code: 'NO_USER',
          message: 'User not found'
      }}
    }
  }



  /**
   * Delete a user's address.
   * Unlike the updateAddress and addAddress where we
   * send an entire object here, we simply send the ID
   */
  
  static async deleteAddress (ctx)
  { 
    const requestId = ctx.request.query.id
    if (!requestId)
    {
      return
    }

    const [userKey, user] = await User._getUserEntity(ctx)

    if (!user)
    {
      return ctx.body = { result: 0, payload: 'Error.' }
    }
    
    user.shippingAddresses = user.shippingAddresses.filter(o => o.id != requestId)
    
    try
    {
      await ds.update({ key: userKey, data: user })
      return ctx.body = {
        result: 1, payload: {
          message: 'Address deleted!',
          addresses: user.shippingAddresses
        }
      }
    }
    catch (e)
    {
      // TODO log e
      return ctx.body = {
        result: 'error', payload: {
          message: 'Could not delete address'
        }
      }
    }

  }




 /*********************************************************
  * USER ACCOUNT
  *********************************************************/

  /**
   * Registers a user
   */

  static async register (ctx)
  {
    
    console.log('---REGISTER ROUTE ---')
    const email = ctx.request.body.email.toLowerCase()
    const password = ctx.request.body.password
    const passwordMin = validation.global.password.minLength
    const passwordMax = validation.global.password.maxLength
    
       
    
    if (!isEmail(email))
    {
      return ctx.body = { result: 0, payload: "Invalid e-mail" }
    }

    if (!isLength(password, {min: passwordMin, max: passwordMax}))
    {
      return ctx.body = {result: 0, payload: "Password must be 4-25 characters long"}
    }

    const mailLockKey =  ds.key(['MailLock', email])
    const emailExists = await ds.get(mailLockKey)

    if (emailExists[0] !== undefined)
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: "E-mail is already registered. <a href='/reset-password'>Forgot password?</a>"
        }
      }
    }
    
    // At this point, email does not exist and account can be created.
    // Let's first create a Stripe customer and grab its id
    // Before inserting into the datastore, create Stripe user
    // TODO if user updates email, update in stripe too
    // TODO if adding to stripe fails, delete from datastore
    
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    const emailDomain = 'mail.bnbcrate.com'
    const mailgun = Mailgun({
      apiKey: process.env.MAILGUN_SECRET_KEY,
      domain: emailDomain
    })

    const stripeCustomer = await stripe.customers.create({
      description: `Customer: ${email}`,      
    })
    
    const hash = bcrypt.hashSync(password, 10)

    const transaction = ds.transaction()
    
    await transaction.run()

    const userKey = ds.key(['User'])

    // Allocate one id in datastore. 
    const allocatedUser = await transaction.allocateIds(userKey, 1)

    // Our allocated id. We'll create a User key with it later
    const userId = allocatedUser[0][0].id
    
    // Unique token
    const token = jwt.sign({
      email: ctx.request.body.email,
      id: userId,
      stripeId: stripeCustomer.id,
    }, process.env.JWT)

    // We will send this to client, and set some values
    // for userEntity from here. Any information that isn't
    // needed on client state should be omitted.
    // 1: root
    // 5: admin
    // 9: normal user
    const userState = {
      jwt: token,
      email: email,
      stripeId: stripeCustomer.id,
      addresses: [],
      level: 9,
      preferences: { receiveEmails: true },
    }

    // User stored in datastore. Some (default) values used from userState
    const userEntity = {
      key: ds.key(['User', userId]),
      data: [
        {
          name: 'email',
          value: userState.email
        },
        {
          name: 'password',
          value: hash,
          excludeFromIndexes: true,
        },
        {
          name: 'stripeId',
          value: userState.stripeId,
        },
        {
          name: 'addresses',
          value: userState.addresses,
          excludeFromIndexes: true,
        },
        {
          name: 'preferences',
          value: userState.preferences,
          excludeFromIndexes: true,
        },
        {
          name: 'level',
          value: 9,
          excludeFromIndexes: true,
        }
      ]
    }

    const mailLockEntity = {
      key: mailLockKey,
      data: [
        {
          name: 'userId',
          value: userId
        }
      ]
    }   
    
    try
    {      
      await transaction.save([mailLockEntity, userEntity])          
      
      // Only want to commit if no errors were thrown above.
      // Once you commit, rolling back a transaction will error.
      // So, ie, if process.env.JWT isnt set, the above
      // token will error, and we won't be able to roll back
      // if we put commit before that.
      await transaction.commit()

      // Send email - Inside a try because if email fails, we don't
      // want to rollback the user registration transaction above.
      // Email is low priority so if it fails, let it fail, but
      // Keep user registered
      try
      {
        let emailHtmlPath = `${__dirname}/../email-templates/register.html`
        let emailTemplate = readFileSync(emailHtmlPath, 'utf-8')
        let emaildata = {
          from: `bnbcrate <welcome@${emailDomain}>`,
          to: email.toLowerCase(),
          subject: 'Welcome to bnbcrate!',
          html: emailTemplate
        }      

        // But don't wait for it. If it fails, it fails. user already registered
        mailgun.messages().send(emaildata, (e, body) => {
          if (e)
          {
            // TODO log
          }        
        })
      }
      catch (e)
      {
        // TODO log
      }
      
      
      // This becomes the user's state on the client
      return ctx.body = {
        result: 1,
        payload: userState
      }
    }
    catch (e)
    {      
      // TODO log
      await transaction.rollback()

      // Delete stripe customer too
      stripe.customers.del(stripeCustomer.id, (e, confirm) => { 
        if (e)
        {
          //TODO log - stripe deletion failure after ds insertion failure
        }
      })

      return ctx.body = {
        result: 0,
        payload: {
          message: 'an error occurred.'
        }
      }
    }
    finally {
      // Add user to mail list. do nothing if this errors.
      // The reason this is here even registration errors/fails,
      // Is because user at least tried to sign up. He may give up,
      // But in the future he will get our emails and maybe change mind.
      let user = {
        subscribed: true,
        address: email,
        name: ''
      }
      
      let list = mailgun.lists(`news@${emailDomain}`)
      list.members().create(user, (e, data) => { })
    }
    
    

  }
  

  /**
   * Logs a user in
   */

  static async login (ctx)
  {
    let email = ctx.request.body.email.toLowerCase()  || ''
    let password = ctx.request.body.password || ''
    
    if (!isEmail(email))
    {      
      return // TODO log
    }

    if (!password)
    {      
      return // TODO log
    }

    let mailLockKey =  ds.key(['MailLock', email])
    let mailLock = await ds.get(mailLockKey)    
    mailLock = mailLock[0]    
   
    if (mailLock == undefined)
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: "Invalid username/password"
        }
      }
    }

    
    let userKey = ds.key(['User', mailLock.userId])
    let user = await ds.get(userKey)
    user = user[0]
       
    if (!user || !bcrypt.compareSync(password, user.password))
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: "Wrong username/password"
        }
      }
    }    
    
    let token = jwt.sign({
      email: ctx.request.body.email,
      id: mailLock.userId,
      level: user.level,
      stripeId: user.stripeId
    }, process.env.JWT)


    return ctx.body = {
      result: 1,
      payload: {
        jwt: token,
        email: email,
        stripeId: user.stripeId,
        //id: mailLock.userId,
        addresses: user.addresses,
        preferences: user.preferences,
        // We don't want to fetch Stripe for credit cards and slow down
        // login process. Send back empty array, after login, fetch
        // the cards and populate the state on the front end
        cards: [], 
      }
    }
  }




  /**
   * Resets a user's password
   */
  static async resetPassword (ctx)
  {

    // 1. See if email exists. get email and user id, and create a hash
    // 1. create [id]   [email]   [hash]   [expiry (24hrs from now)]
    // 2. send email to user
    // 3. bnbcrate.com/reset-password?hash=123ij123im123im13j1n 23mkn23
    //   - before mount, fetch hash from db, see if it expired
    // 4. show form

    const email = ctx.request.body.email ? ctx.request.body.email.toLowerCase() : ''
    const form = ctx.request.body.form

    if (!isEmail(email))
    {
      // TODO log - someone tried to post no email
      return ctx.body = { result: 0 }
    }
   

    if (form == 'forgot')
    {
      const hash = crypto.randomBytes(20).toString('hex')

      const resetEntity = {
        key: ds.key(['Reset', hash]),
        data: [
          {
            name: 'email',
            value: email.toLowerCase()
          },          
          {
            name: 'expiry',
            value: Date.now()
          }   
        ]
      }

      await ds.upsert(resetEntity)
      .then(() => {
        const emailDomain = 'mail.bnbcrate.com'
        const mailgun = Mailgun({ apiKey: process.env.MAILGUN_SECRET_KEY, domain: emailDomain })
        
        const emaildata = {
          from: `bnbcrate password <passwordreset@${emailDomain}>`,
          to: email,
          subject: 'bnbcrate password reset',
          html: `
          <html>
          You've requested a password reset for your bnbcrate.com account.
          <br>
          <br>
          <a href='/reset-password#${hash}'>Click here to set your new password</a>
          <br><br>
          If you haven't requested a password reset, please disregard this email.
          </html>
          `
        }  
        mailgun.messages().send(emaildata, (e, body) => {
          if (e)
          {
           // TODO log 
           
          }
        })        
        return ctx.body = { result: 1, payload:  { hash, } }
      })
      .catch(e => {
        // TODO log
        return ctx.body = { result: 0 }
      })
    }
    else if (form == 'reset')
    { 
      const password = ctx.request.body.password
      var hash = ctx.request.body.hash || ''
      const passwordMin = validation.global.password.minLength
      const passwordMax = validation.global.password.maxLength

      if (!isLength(password, { min: passwordMin , max: passwordMax}))
      {
        return ctx.body = { 
          result: 0,
          payload: {
            message: validation.global.password.message
          }
        }
      }


      if (!hash)
      {
        return ctx.body = { result: 0, payload: { message: 'Need a hash.' } }
      }

      // If hash starts with a #, strip it
      if (hash[0] == '#')
      {
        hash = hash.slice(1)
      }      
      
      // 1. fetch hash.  
      const resetKey = ds.key(['Reset', hash])
      var resetEntity = await ds.get(resetKey)
      
      resetEntity = resetEntity[0]     

      if (!resetEntity)
      {
        return ctx.body = { 
          result: 0, 
          payload: { 
            message: 'Hash not found'
          }
        }
      }     
      

      // If email sent here doesn't match email for hash in ds
      if (resetEntity.email.toLowerCase() != email)
      {
        return ctx.body = { 
          result: 0, 
          payload: { 
            message: 'Wrong e-mail'
          }
        }
      }

      // If hash expired TODO
      // https://momentjs.com/docs/#/displaying/difference/
      // 86400 seconds in a day. Check difference from Date.now() in ds        
      if (moment().diff(resetEntity.expiry, 'seconds')  > 86400)
      {
        return ctx.body = { 
          result: 0,
          payload: {
            message: 'Hash expired. Please try resetting your password again.'
          }
        }
      }


      // 1. grab user by email (query)
      const userQuery = ds.createQuery('User')
        .filter('email', '=', email)
        .limit(1)
      
      var userEntity = await ds.runQuery(userQuery)
      userEntity = userEntity[0][0]

      if (!userEntity)
      {
        return ctx.body = { 
          result: 0,
          payload: { message: 'User not found.' }
        }
      }     
      

      // 2. Update user entity with new password          
      const newUserEntity = { 
        key: userEntity[ds.KEY],
        data: { ...userEntity, password: bcrypt.hashSync(password, 10) }
      }
      
      await ds.update(newUserEntity).then(() => {
        // Hash has been used. Delete it.
        // If it fails to delete, cron will delete within 24hr
        ds.delete(resetKey)     
        return ctx.body = {
          result: 1,
          payload: {
            message: 'Password has been changed!'
          }
        }
      })
      .catch(e => {
        // TODO log
        return ctx.body = {
          result: 0,
          payload: { message: 'Could not update password.' }
        }
      })
    }  
  }


  /**
   * Updates/changes a user password.
   */

  static async updatePassword (ctx)
  {
    const currentPassword = ctx.request.body.current
    const newPassword1 = ctx.request.body.new
    const newPassword2 = ctx.request.body.new2

    const passwordMin = validation.global.password.minLength
    const passwordMax = validation.global.password.maxLength

    if (!currentPassword || !newPassword1 || !newPassword2)
    {      
      return // TODO log.      
    }

    if (!isLength(newPassword1, {min: passwordMin, max: passwordMax}))
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: validation.global.password.message
        }
      }
    }
    
    const [userKey, user] = await User._getUserEntity(ctx)    

    if (!bcrypt.compareSync(currentPassword, user.password))
    {    
      return ctx.body = {
        result: 0,
        payload: {
          message: "Current password isn't valid"
        }
      }
    }    
    
    try
    {      
      await ds.update({ key: userKey, data: {...user, password: bcrypt.hashSync(newPassword1, 10)} })
      return ctx.body = {
        result: 1,
        payload: {
          message: 'Password updated!'
        }
      }
    }
    catch (e)
    {
      // TODO log
      return ctx.body = {
        result: 0,
        payload: {
          message: 'Unknown error!'
        }
      }      
    }
    
  }


  
  


  /*********************************************************
  * USER CREDIT CARDS
  *********************************************************/

  /**
   * Saves a credit card for the user
   */

  static async addCreditCard (ctx)
  {    
    // 1. Grab user's Stripe id
    const [, user] = await User._getUserEntity(ctx)

    if (!user)
    {
      console.log('NO USER!! -- addCreditCard')
    }

    const token = ctx.request.body.token    

    // 2. Append the credit card (hashed as a token) to the customer
    try
    {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
      const card = await stripe.customers.createSource(user.stripeId, { source: token.id })
      return ctx.body = { result: 1, payload: {
        card,
        message: 'Credit card added!'
      }}  
    }
    catch (e)
    {
      // TODO log
      return ctx.body = { result: 0, payload: {
        message: 'Unknown error. Please try again.'
      }}
    }    
  }



  /**
   * returns a list of user's credit cards
   */

  static async getAllCreditCards (ctx)
  {  
    const [, user] = await User._getUserEntity(ctx)
    if (!user)
    {
      return ctx.body = {result: 0}
    }
    try
    {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
      const cards = await stripe.customers.listCards(user.stripeId)        
      return ctx.body  = { result: 1, payload: { cards: cards.data } }
    }
    catch (e)
    {
      // TODO log
      return ctx.body = {
        result: 0,
        payload: {
          message: 'Could not get your saved cards.'
        }
      }
    }     
  }

  
  /**
   * Delete a user's credit card.   
   */ 
  static async deleteCreditCard (ctx)
  { 
    const requestId = ctx.request.query.id
    if (!requestId)
    {
      return
    }

    const [, user] = await User._getUserEntity(ctx)

    if (!user)
    {      
      return ctx.body = { result: 0, payload: 'Error.' } // TODO log
    }
    
    var ret = { result: null, payload: {} }

    try
    {
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
      const req = await stripe.customers.deleteCard( user.stripeId, requestId )
      if (req.deleted)
      {
        ret.result = 1
      }
      else
      {
        ret.result = 0
      }
    }
    catch (e)
    {
      ret.result = 0  // TODO log e
    }

    if (ret.result)
    {
      ret.payload.message = 'Credit Card deleted!'
    }
    else
    {
      ret.payload.message = 'Could not delete card!'
    }

    return ctx.body = ret

  }


  /*********************************************************
  * USER PREFERENCES
  *********************************************************/

  /* No need for getUserpreferences - done when logging in */

  /**
   * Updates user's preferences object.
   * We do validation for each field here, too.
   */

  static async updatePreferences (ctx)
  {
    
    const preferences = ctx.request.body.preferences
    const [userKey, user] = await User._getUserEntity(ctx)
    

    // Initiate Mailgun
    const emailDomain = 'mail.bnbcrate.com'
    const mailgun = Mailgun({
      apiKey: process.env.MAILGUN_SECRET_KEY,
      domain: emailDomain
    })
    const list = mailgun.lists(`news@${emailDomain}`)

    
    
    // receiveEmails must be bool
    if (typeof preferences.receiveEmails != 'boolean')
    {
      preferences.receiveEmails = true
    }
    
  
    
    let userEmail = ctx.state.user.email
    let subscribed = preferences.receiveEmails
    
    try
    {
      const updated = await list.members(userEmail).update({"subscribed" : subscribed})
      return ctx.body = { result: 1 }
    }
    catch (e)
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: 'Unknown error'
        }
      }
    }
  }



  /*********************************************************
  * ORDERS
  *********************************************************/

  /**
   * Grabs user's order history.
   */

  static async getOrders (ctx)
  {    
    if (!ctx.state.user.id)
    {
      return
    }


    const query = ds.createQuery('Order')
      .filter('userId', '=', ctx.state.user.id)
      //.order('date', { descending: true })
      
    try
    {
      var results = await ds.runQuery(query)
      const orders = results[0].map(o => {
        var items = []
        Object.keys(o.items).forEach(crateName => {
          // [shower crate, 2], etc        
          items.push([crateName, o.items[crateName].quantity])
        })
        return {
          total: o.total,
          items,            
          date: new Date(o.date).toString().split(' ').slice(1, 4).join(' '),
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
      console.log('error fetching order')
    }
    
    
    

    
  }



  /*********************************************************
   * PRIVATE METHODS.
   * Mostly helpers
   *********************************************************/

  /**
   * Grabs a User entity from the datastore.   
   */
  static async _getUserEntity (ctx)
  {
    
    // No JWT token
    if (!ctx.state.user)
    {      
      return [null, null]
    }    
    
    let userKey = ds.key(['User', ctx.state.user.id])    
    
    let user = await ds.get(userKey)

    if (user[0] == undefined)
    {      
      
      return [null, null]
    }
    else
    {
      return [userKey, user[0]]
    }
  }

}
