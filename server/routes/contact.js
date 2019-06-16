/*
TThe flow is really easy: 
you collect card details client-side,
│  you create a token, you send the token to the server and there you create a customer or
│  add the card to an existing one.
*/

import { join } from 'path'
import { readFileSync } from 'fs'
import Mailgun from 'mailgun-js'
//import Datastore from '@google-cloud/datastore'

import { isEmail, isLength, isAlpha, isBolean } from 'validator'
import { isBoolean } from 'util';


//const ds = Datastore()




export default class Contact
{


  // TODO pass a fucked up data obj 0ie, missing crates.qiantity)
  static async contact (ctx)
  { 
    // "" instead of null so Validator library doesn't throw errors
    const email = ctx.request.body.email || ""
    const topicId = ctx.request.body.topic || "" 
    var msg = ctx.request.body.msg || ""
    

    const emailDomain = 'mail.bnbcrate.com'
    
       
    // For now we just use this for the topic.
    // One day when i'm rich and can afford multiple email addresses,
    // i'll use those.
    const topicMap = {
      "1": {
        topic: "Orders",
        email: `orders@${emailDomain}`
      },
      "5": {
        topic: "Payments",
        email: `payments@${emailDomain}`
      },
      "10": {
        topic: "Shipping",
        email: `Shipping@${emailDomain}`
      },
      "15": {
        topic: "General Questions",
        email: `questions@${emailDomain}`
      },
      "20": {
        topic: "Business",
        email: `business@${emailDomain}`
      },
      "25": {
        topic: "Press",
        email: `press@${emailDomain}`
      },      
      "30": {
        topic: "website",
        email: `website@${emailDomain}`
      }
    }
       

    // Don't even return an error for these because if it happens
    // it means someone tried to bypass js validation on client. Fuck'em    

    if ( !(topicId in topicMap))
    {
      return
    }

    if (!isEmail(email) || !isLength(msg, {min: 20, max: 500}))
    {       
      return
    }

    const mailgun = Mailgun({ apiKey: process.env.MAILGUN, domain: emailDomain })

    const emaildata = {
      from: email,
      to: `bnbcrate <hello@bnbcrate.com>`,
      subject: topicMap[topicId].topic,
      text: msg
      
    }      

    try
    {
      await mailgun.messages().send(emaildata)  
      return ctx.body = {
        result: 1,
        payload: {
          message: 'Thank you. We will contact you shortly!'
        }
      }
    }
    catch (e)
    {
      return ctx.body = {
        result: 0,
        payload: {
          message: 'Could not deliver mail'
        }
      }
    }
      
    



   


    
  }

}
