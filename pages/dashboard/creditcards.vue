<template>

  <v-container>
      <v-snackbar 
      v-model='snackbar.show' :color='snackbar.color'
      :timeout='4000'
      :absolute='false'
      :top='true'>
      {{ snackbar.text }}
      </v-snackbar>

      <header>
        <h3>Credit Cards</h3>
        <p>
          Having credit cards saved allows you<br>
          to select them during checkout
          for a speedier process.
        </p>
        
        <div style="text-align:center">
          <v-card-text style="margin: 0 auto">
            <v-btn color='primary' @click.native.stop="toggleNewCreditCardForm">add new credit card</v-btn>
          </v-card-text>    
        </div>
        
      </header>   
      
      
      <!-- New Credit Card Form -->
      <div style="visibility: hidden" id="newCreditCardForm">
          <!-- <a class="close-form" @click.prevent='toggleNewCreditCardForm'>x</a> -->
          <v-layout row wrap>
            <!-- Payment -->
            <v-flex d-flex xs12>
              <v-card-text>
                <label>
                  <div>Credit card number</div>
                  <div id='cardNumber-mount'></div>
                  <span class="icon"><i class="material-icons">credit_card</i></span>
                </label>
                <div class="input-error" v-if='ccNumberError'>{{ccNumberError}}</div>
              </v-card-text>
            </v-flex>
            <v-flex d-flex xs6>
              <v-card-text>
                <div>Expiration</div>
                <div id='cardExpiry-mount'></div>  
                <div class="input-error" v-if="ccExpiryError">{{ccExpiryError}}</div>
              </v-card-text>
            </v-flex>
            <v-flex d-flex xs6>
              <v-card-text>
                <div>Security Code</div>
                <div id='cardCvc-mount'></div>
                <div class="input-error" v-if='ccCvcError'>{{ccCvcError}}</div>
              </v-card-text>                
            </v-flex>
          </v-layout>

          <v-layout>
            <v-flex xs11>
              <v-card-text>
                <v-btn
                  block
                  color='secondary'
                  large
                  :loading='isSubmitting'
                  @click='addCreditCard'>
                  SAVE CREDIT CARD
                </v-btn>
              </v-card-text>
            </v-flex>
            <v-flex>
              <v-card-text>
                <v-btn          
                color='error'
                large
                @click="toggleNewCreditCardForm">
                cancel
                </v-btn>
              </v-card-text>
            </v-flex>
          </v-layout>
      </div>         
              
           
      <div v-if="isFetching">
        <loading />
      </div>
      <div v-else>

        <v-card flat class="no-address" v-if='Array.isArray(creditCards) && !creditCards.length'>
          You have no cards saved.
        </v-card>
          
        <div v-for='(card, i) in creditCards' :key='i' if='creditCards.length'>
          <div>
              <v-card flex xs12>
                <v-card-text style="padding:0">
                  <div class="card-info">
                    <div class="card-number">{{ card.brand }} ending in ... <b>{{ card.last4 }}</b></div>
                    <div class="card-exp">Expires: {{ card.exp_month }} / <b>{{ card.exp_year }}</b></div>
                    <div>
                      <v-btn          
                        color='error'                      
                        @click="deleteCard(card.id)">
                        Delete
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
          </div> 
        </div>
      </div>
        
        

  </v-container>
</template>


<script>
// https://stackoverflow.com/questions/41663010/update-parent-model-from-child-component-vue

import axios from 'axios'
import Loading from '../../components/Loading'
export default {
  components: {
    Loading,
  },
  data()
  {
    return {
      isFetching: true,
      isSubmitting: false,
      showNewCCForm: false,
      creditCards: [],
      ccSubmitError: '', // Handles response from server
      ccNumberError: '',
      ccCvcError: '',
      ccExpiryError: '',
      snackbar: {
        show: 0,
        text: null,
        color: null,
      },
    }
  },

  methods: {   

    toggleNewCreditCardForm ()
    {
      var element = window.document.getElementById('newCreditCardForm')
      var display = element.style.display == 'none' ? 'block' : 'none'
      window.document.getElementById('newCreditCardForm').style.display = display
    },


    /**
     * Handles form to add a new card.
     * Card is handled by Stripe. So we call stripe.createToken
     * which returns a token. We then send that token to the server,
     * where we then grab the user's stripe customer 
     * (a stripe customer id, stored in datastore in user entity)
     * and append this credit card to that customer. All we need
     * to create a new card is a customer id and a token, but
     * we dont' want to store the customer id in jwt,
     * that's why we send the token to the server, and then
     * make an api call to Stripe from there.
     */

    addCreditCard ()
    {
      this.isSubmitting = true

      // 1. Fetch Stripe token from user
      stripe.createToken(cardNumber).then(async result => {
        if (result.error)
        { 
          // Stripe shows validation error for us. No need to do it.
          // Only show other type of errors
          if (result.error.type != 'validation_error')     
          {
            this.snackbar.show = 1
            this.snackbar.text = 'A Stripe error occurred.'
            this.snackbar.color = 'error'
            this.isSubmitting = false
          }
          return
        }
        
        const req = await axios({
          method: 'post',
          url: `${window.api}/user/cards`,
          headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`},
          data: { token: result.token }
        })
        
        this.snackbar.show = 1
        this.snackbar.text = req.data.payload.message
        this.snackbar.color = req.data.result ? 'success' : 'error'

        if (req.data.result)
        {
          this.creditCards.push( req.data.payload.card )
          this.isSubmitting = false
        }
        else
        {
          this.snackbar.show = 1
          this.snackbar.text = req.data.payload.message
          this.snackbar.color = req.data.result ? 'success' : 'error'
        }
        this.isSubmitting = false
      })
      
      
    },



    /**
     * Deletes a credit card
     */

    async deleteCard (id)
    { 
      const req = await axios({
        method: 'delete',
        url: `${window.api}/user/cards/?id=${id}`,
        headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`}
      })

      if (req.data.result)
      {
        this.creditCards = this.creditCards.filter(o => o.id != id)
      }
      
      this.snackbar.show = 1
      this.snackbar.text = req.data.payload.message
      this.snackbar.color = req.data.result ? 'success' : 'error'
    },

  },
  
  async mounted()
  {
    
    
    /*******************************************************
     * Mounts form for adding new card
     *******************************************************/

    // Style elements & styling
    window.stripe = Stripe('pk_test_0CoPbVlrcNnupYEd1fSRlrWU');
    var elements = stripe.elements();    
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        background: 'none',
        boxShadow: 'none',
        fontSize: '18px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create stripe elements (individually so they're responsive)    
    window.cardNumber = elements.create('cardNumber', {style: style})
    window.cardCvc = elements.create('cardCvc', {style: style})
    window.cardExpiry = elements.create('cardExpiry', {style: style})
    
    // Mount the above-created elements in these divs
    window.cardNumber.mount('#cardNumber-mount');
    window.cardCvc.mount('#cardCvc-mount');
    window.cardExpiry.mount('#cardExpiry-mount');
    
    // So if the div is hidden on page load, Stripe can't mound the
    // credit card fields in it. So it's initially 'hidden', and here,
    // after form is mounted, we make it visible, and hide after so
    // we can toggle with display none or block when button is clicked.
    window.document.getElementById('newCreditCardForm').style.visibility = 'visible'
    window.document.getElementById('newCreditCardForm').style.display = 'none'

    // Real-time validation
    window.cardNumber.addEventListener('change', ({ error }) => {      
      this.ccNumberError = error ? error.message : ''
    });

    window.cardCvc.addEventListener('change', ({ error })  => {
      this.ccCvcError = error ? error.message : ''
      
    });

    window.cardExpiry.addEventListener('change', ({ error }) => {      
      this.ccExpiryError = error ? error.message : ''    
    });


    /*******************************************************
     * Fetches customer cards
     *******************************************************/
    
    // 1. Fetch Stripe's customer id from datastore
    const req = await axios({
      method: 'get',
      url: `${window.api}/user/cards`,
      headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`}
    })
    
    if (req.data.result)
    {
      this.creditCards = req.data.payload.cards
      this.isFetching = false
      
    }
    
    this.isFetching = false
  },
}
</script>

<style lang='stylus' scoped> 
  .input-error
    color #FF5252

  .no-address
    font-size 2em
    color #555    
    padding 3vmax
    text-align center
    border 1px dashed darken(#eee,5%)
    margin-top 2em
    & .card__text
      padding-bottom 0

  .card-info
    display flex
    justify-content space-between
    align-items baseline
    padding 0.3em 1em
    color #999
    
  #newCreditCardForm
    margin-bottom 2em
    background white
    padding 0
    
    // & > a
    //   position absolute
    //   right -10px
    //   top -10px
    //   color white
    //   background #FF5252
    //   box-shadow 1px 1px 3px alpha(black, 40%)
    //   border-radius 20px
    //   height 30px
    //   width 30px
    //   line-height 30px
    //   text-align center

  #newCreditCardForm
    position relative
  #cardNumber-mount
    padding-left 3em
    
    & + span.icon
      position absolute
      top -33px
      left 6px
      width 50px;
      height 50px;
      z-index 100
  .card__text label
    position relative
  
</style>