<template>

    <v-container class="container" grid-list-xl>
        <header>
          <h3 class="display-1">Secure Checkout</h3>
        </header>      
     
        <v-layout wrap>

          
          <!-- Left Side -->
          <v-flex xs12 sm8 md8 lg6 offset-lg1>
            <v-layout class="steps" row wrap>

              <!-- Guest Name -->
              <!-- <v-flex d-flex xs12>
                <v-card v-bind:class="steps.one.mode">
                  <v-card-text>
                    <v-form ref='form-one'>
                      <div class="step-header">                        
                        
                        <span class='step-title'>                          
                          <div>
                            <span class="step-number">1</span>
                            Guest's name (optional)
                          </div>
                          <a v-if="steps.one.mode == 'completed-step'" @click.prevent="editStep('one')">edit</a>
                        </span>
                      </div>
                      <div class="step-content">
                        <p class="hint">
                          If given, the guest's name will be engraved on the crate.
                          <br>
                          You are not charged for this.                          
                        </p>
                        <v-text-field   
                          placeholder="Guest's name"                          
                          class="input-group"
                          maxlength="30"
                          v-model="guest">            
                        </v-text-field>
                        <v-btn
                          class="step-button primary"
                          block
                          large                          
                          @click="goToNextStep('one','two')">
                            continue
                          </v-btn>
                      </div>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-flex> -->


              <!-- Shipping -->
              <v-flex d-flex xs12>
                <v-card v-bind:class="steps.one.mode">
                  <v-card-text>
                    <v-form ref='form-one'>
                      <div class="step-header">                        
                        <span class='step-title'>
                          <div>
                            <span class="step-number">1</span>
                            Shipping Address
                          </div>
                          <a v-if="steps.one.mode == 'completed-step'" @click.prevent="editStep('one')">edit</a>
                        </span>                        
                      </div>
                      <div class="step-content">
                        <!-- check to see if addresses.length.if so, show dropdown.
                        if not, show form with checkbox to save addr (if logged in) -->
                        <small>
                          Tip: You could ship the crate to your property and let
                          the guest know that there is a package waiting for them.
                          Or if you have a cleaning crew, you could ask them
                          to leave the crate on the bed for the guest.
                        </small>

                        <v-card-text style="padding-bottom: 0">
                          <!-- Receipient Name -->
                          <v-text-field
                            v-model='shippingName'
                            maxlength="25"
                            label="Name"                            
                            class="input-group">            
                          </v-text-field>

                          <!-- Saved Address Dropdown -->
                          <div v-if='this.addresses.length'>                   
                            <v-select
                              :value='$store.state.checkout.shipping.id'
                              :items="addresses"                              
                              label="Select an address"                              
                              item-text='street'
                              item-value='id'
                              @change='updateshipping'
                              return-object>
                            </v-select>
                          

                          <!-- Make new address form visible -->
                          <a href='#'
                            class="toggle-form"
                            v-if='this.addresses.length'
                            @click.prevent='showAddressForm = true'>
                            <span v-if='!showAddressForm'>{{ addressFormText[0] }}</span>
                            <span v-else>{{ addressFormText[1] }}</span>
                          </a>
                          </div>

                          <!--  New Address form -->
                          <div v-if='showAddressForm' class="new-address-form">

                            <v-text-field
                              v-model='street'
                              label="Street Address"  
                              :rules="rules.street"                                                       
                              required
                              class="input-group">            
                            </v-text-field>
                          
                            <v-text-field
                              v-model='city'
                              label="City"                              
                              :rules="rules.city"
                              required
                              class="input-group">            
                            </v-text-field>                      
                          
                            <v-select
                              v-model='state'
                              :items="states"
                              :rules="rules.state"                   
                              label="Select State"
                              single-line
                              required>
                            </v-select>                      

                            <v-text-field    
                              v-model='zip'
                              label="Zip"                              
                              :rules="rules.zip"
                              required
                              class="input-group">            
                            </v-text-field>

                            <v-checkbox
                              label="Save this address for future use"
                              v-if='$store.state.user.jwt'
                              v-model='saveAddress'>
                            </v-checkbox>
                          </div>
                        </v-card-text>
                          
                        <v-btn
                          class="step-button primary"
                          block
                          large
                          @click="goToNextStep('one','two')">
                            continue
                          </v-btn>
                      </div>
                    </v-form>
                  </v-card-text>
                </v-card>          
              </v-flex>


              <!-- Payment -->
              <v-flex d-flex xs12>
                <v-card v-bind:class="steps.two.mode">
                  <v-card-text>
                    <v-form ref='form-two'>
                      <div class="step-header">
                        <span class='step-title'>
                          <div>
                            <span class="step-number">2</span>
                            Payment
                          </div>
                          <a v-if="steps.three.mode == 'completed-step'" @click.prevent="editStep('two')">edit</a>
                        </span>                   
                      </div>
                      <div class="step-content">

                        <!-- CC Select -->
                        <v-card-text v-if='$store.state.user.jwt && cards.length'>
                          <v-select                           
                            :items="cards"
                            v-model='selectedCard'
                            label="Select a credit card"
                            item-text='value'
                            item-value='id'
                            @change="toggleCardFormStyle('none')"
                            return-object>
                          </v-select>

                          <v-alert color="error" icon="warning" value="true" v-if='selectedCardError'>
                            {{ selectedCardError }}
                          </v-alert>

                          <v-alert color="error" icon="warning" value="true" v-if='ccSubmitError'>
                            {{ ccSubmitError }}
                          </v-alert>                            

                          <v-btn                          
                            block
                            large
                            dark
                            class="green"
                            v-if='!showCardForm'
                            :loading='isSubmitting'
                            :disabled="$store.getters['cart/cartTotal'] <= 0"
                            @click.prevent="handleCreditCardSubmit('select')">
                              <v-icon left dark>lock</v-icon>                            
                              PAY ${{ $store.getters['cart/cartTotal'] }}
                          </v-btn>             

                            <!-- Link to make credit card form visible -->
                          <a href='#'
                            class="toggle-form"
                            v-if='this.cards.length && !this.showCardForm'
                            @click.prevent='toggleCardFormStyle("block")'>
                            or click to use a new card
                          </a>
                        </v-card-text>
                        
                        <!-- Credit Card form -->           

                        <v-card-text class="cardform-container" v-bind:style='{ display: cardFormStyle }'>
                          <div class="cardform">
                            <v-card-text>
                              <label>
                                <div>Credit card number</div>
                                <div id='cardNumber-mount' class="stripe-field"></div>
                                <div class="input-error" v-if='ccNumberError'>{{ccNumberError}}</div>
                                <span class="icon"><i class="material-icons">credit_card</i></span>
                              </label>                              
                            </v-card-text>

                            <v-card-text>
                              <label>
                                <div>Expiration</div>
                                <div id='cardExpiry-mount' class="stripe-field"></div>  
                                <div class="input-error" v-if="ccExpiryError">{{ccExpiryError}}</div>
                                <span class="icon"><i class="material-icons">event_note</i></span>
                              </label>
                            </v-card-text>

                            <v-card-text>
                              <label>
                                <div>Security Code</div>
                                <div id='cardCvc-mount' class="stripe-field"></div>
                                <div class="input-error" v-if='ccCvcError'>{{ccCvcError}}</div>
                                <span class="icon"><i class="material-icons">lock</i></span>
                              </label>
                            </v-card-text>

                            <v-card-text style="padding-top: 0">                                
                              <v-text-field
                                label='Your e-mail'
                                :rules="rules.email"
                                v-model='email'
                                persistent-hint
                                hint="Your receipt will be sent here">
                              </v-text-field>                                
                            </v-card-text>

                            <v-alert color="error" icon="warning" value="true" v-if='ccSubmitError'>
                              {{ ccSubmitError }}
                            </v-alert>

                            <v-btn
                              class="green"
                              dark
                              block
                              large
                              :loading='isSubmitting'
                              :disabled='$store.getters.total <= 0'
                              @click.prevent="handleCreditCardSubmit('form')">
                                <v-icon left dark>lock</v-icon>                            
                                PAY ${{ $store.getters['cart/cartTotal'] }}
                            </v-btn>
                          
                          </div>
                        </v-card-text>                 
                        
                      </div>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-flex>              

            </v-layout>         
          </v-flex>


          <!-- Right side -->
          <v-flex xs12 sm4  md4 lg4 class="summary">
            <v-card>
              <v-card-text>
                <h5>Order Summary</h5>

                <div class="summary-items">
                  <div v-for="crate in $store.state.cart.items" :key='crate.id'>
                    <div>
                      <!--
                      <input type="text" v-model='$store.state.crates[key].quantity' :value='$store.state.crates[key].quantity'> {{key}} crate
                      -->
                      <input type="number" 
                        min='0'
                        max='9'
                        :value='crate.quantity'
                        @change="updateCrate(crate, $event)"> {{crate.name}} crate
                    </div>
                  </div>                          
                </div>
                <!--
                <div class="summary-premium">
                  <v-switch label="Premium crates?"                               
                    v-model="premium"
                    color="primary"
                    hide-details>  
                  </v-switch>
                </div>    
                -->
                <v-card-text>
                <div class="summary-shipping">
                  <div>
                    <h6>Shipping to:</h6>
                  </div>
                  <div v-if='$store.state.checkout.shipping.name'>
                    {{ $store.state.checkout.shipping.name }}
                  </div>
                  <div v-if='$store.state.checkout.shipping.street'>
                    {{ $store.state.checkout.shipping.street }}
                  </div>
                  <div v-if='$store.state.checkout.shipping.city'>
                    {{ $store.state.checkout.shipping.city }}
                    <span v-if='$store.state.checkout.shipping.state'>,</span>&nbsp;
                    {{ $store.state.checkout.shipping.state }}&nbsp;
                    {{ $store.state.checkout.shipping.zip }}
                  </div>
                  <div>{{ $store.state.checkout.email }}
                    </div>
                  <!-- <div class="address-check">Please make sure shipping address above is correct</div> -->
                </div>
                </v-card-text>
              </v-card-text>
            </v-card>
          </v-flex>

        </v-layout>
          
             
    </v-container>

</template>

<script>
import axios from 'axios'
import { isEmail, isCreditCard, isInt, isLength, isAlpha } from 'validator'

import { mapGetters } from 'vuex'
export default {  

  beforeMount ()
  {
    if (!this.$store.state.cart.items.length)
    {
      console.log('!! no items')
      return
      //return this.$router.replace('/')
      
      
    }
    console.log('!! !')
    
  },

  data ()
  {
    return {
      //email: this.$store.state.user.email || this.$store.state.checkout.email || '',
      addresses: [],
      cards: [],

      // If user checks checkbox to save address in list (logged in only)
      saveAddress: false,
      isSubmitting: false,
      addressFormText: [
        'or click here to use a different address', 
        'Enter an address below, or select one above.'
      ],

      // Card dropdown. Error will show if user submits and `selectCard` is null,
      // which means a card wasn't selected from the dropdown
      selectedCard: null,
      selectedCardError: null,
      showAddressForm: true,
      cardFormStyle: 'block',
      showCardForm: true,
      cardFormVisibility: 'hidden',

      // Initial step states. 
      steps: {
        "one": {
          mode: 'active-step'
        },
        "two": {
          mode: 'inactive-step'
        },
        "three": {
          mode: 'inactive-step'
        },
      },
      
      // Applied when user focus and leaves a field, or submits form.
      rules: {
        email: [
          v => !!v || 'E-mail is required for receipt.',
          v => isEmail(v) || 'This e-mail is not valid'
        ],
        name: [
          v => !!v || 'Name is required',
        ],
        street: [
          v => !!v || 'City is required',
          v => isLength(v, { min: 2 }) || 'This field is required'
        ],
        zip: [
          v => !!v || 'Zip code is required',
          v =>  /[0-9]+/i.test(v) || 'Enter a valid zip code'
        ],
        city: [
          v => !!v || 'City is required',
          v => isLength(v, { min: 1 }) || 'Enter a valid city'
        ],
        state: [
          v => !!v || 'This field is required',
          v => isAlpha(v) && isLength(v, { min: 2, max: 2 }) || 'Use 2 letters'
        ]
        
      },
      states: [
        "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", 
        "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", 
        "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", 
        "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", 
        "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", 
        "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", 
        "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", 
        "WV", "WI", "WY"
      ],
      ccSubmitError: null, // Handles response from server
      ccNumberError: '',
      ccCvcError: '',
      ccExpiryError: ''
    }
  },

  

  async mounted()
  {    
    
    // Stripe element styling    
    window.stripe = window.Stripe(process.env.STRIPE_PUBLIC_KEY);
    var elements = stripe.elements();    
    var style = {
      base: {
        color: '#32325d',
        //lineHeight: '18px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        //backgroundColor: '#000000',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };


    /**
     * Mount each card element individually so 
     * that they can be responsive and stack in mobile
     */
    
    window.cardNumber = elements.create('cardNumber', {style: style})
    window.cardCvc = elements.create('cardCvc', {style: style})
    window.cardExpiry = elements.create('cardExpiry', {style: style})
    
    window.cardNumber.mount('#cardNumber-mount');
    window.cardCvc.mount('#cardCvc-mount');
    window.cardExpiry.mount('#cardExpiry-mount');
    
    
    
    window.cardNumber.addEventListener('change', ({error}) => {      
      if (error)
      {
        this.ccNumberError = error.message
      }
      else
      {
        this.ccNumberError = ''
      }
    });

    window.cardCvc.addEventListener('change', ({error}) => {      
      if (error)
      {
        this.ccCvcError = error.message
      }
      else
      {
        this.ccCvcError = ''
      }
    });

    window.cardExpiry.addEventListener('change', ({error}) => {      
      if (error)
      {
        this.ccExpiryError = error.message
      }
      else
      {
        this.ccExpiryError = ''
      }
    });

    // Fetch user's addresses & credit cards if logged in
    if (this.$store.state.user.jwt)
    {    
      try
      {
        // Addresses
        let req = await axios({
          method: 'get',
          url: `/api/user/addresses`,
          headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`}          
        })
        
        if (req.data.result == 0 && req.data.payload.code == 'NO_USER')
        {
          this.$store.dispatch('logout')
        }
        
        
        if (req.data.payload.addresses.length)
        {     
          this.addresses = req.data.payload.addresses
          this.showAddressForm = false
        }

        // Credit Card
        
        req = await axios({
          method: 'get',
          url: `${window.api}/user/cards`,
          headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`}
        })
        
        if (req.data.payload.cards.length)
        { 
          console.log('ok got cards! ', this.cards)
          this.cards = req.data.payload.cards.map( o => {            
            return {id: o.id, value: `${o.brand} ending in ${o.last4}`}
          })
        }
        else
        {
          this.showCardForm = 'block'
        }
      }
      catch (e)
      {

      }

    }
    else
    {
      // User is not logged in. Show address form
      this.showAddressForm = true
    }

        
    
    // User not logged in, or is logged in but no CC on file
    if (!this.$store.state.user.jwt || (this.$store.state.user.jwt && !this.cards.length))
    {
      this.toggleCardFormStyle('block')
    }
    else if (this.$store.state.user.jwt && this.cards.length)
    {      
      this.toggleCardFormStyle('none')
    }
    
  },

  

  computed: {
    email:
    {
      get ()
      {
        return this.$store.state.checkout.email
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_EMAIL', value)
      }
    },
    guestName:
    {
      get ()
      {
        return this.$store.state.checkout.guestName
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_GUEST_NAME', value)
      }
    },
    shippingName:
    {
      get ()
      {
        return this.$store.state.checkout.shipping.name
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_SHIPPING_NAME', value)
      }
    },
    street:
    {
      get ()
      {
        return this.$store.state.checkout.shipping.street
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_SHIPPING_STREET', value)
      }
    },
    city:
    {
      get ()
      {
        return this.$store.state.checkout.shipping.city
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_SHIPPING_CITY', value)
      }
    },
    state:
    {
      get ()
      {
        return this.$store.state.checkout.shipping.state
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_SHIPPING_STATE', value)
      }
    },
    zip:
    {
      get ()
      {
        return this.$store.state.checkout.shipping.zip
      },
      set (value)
      {
        this.$store.commit('checkout/UPDATE_SHIPPING_ZIP', value)
      }
    },
    /*
    premium:
    {
      get ()
      {
        return this.$store.state.checkout.premium
      },
      set (v)
      { 
        const checkout = { ...this.$store.state.checkout }
        checkout.premium = !checkout.premium
        this.$store.commit('UPDATE_CHECKOUT', checkout)
        
      }
    },
    */
    
   
  },

  methods: {
    
    /**
     * Sets credit card form's css display style
     * to either 'block' or 'none'. The form
     * has to be shown this way because using Vue
     * to show/hide (render/destroy) will unmount
     * Stripe's fields.
     * 
     * @param {str} style - 'block' or 'none'
     */

    toggleCardFormStyle (style)
    {      
      if (style == 'block')
      {
        this.showCardForm = true

        // Reset v-select
        this.selectedCard = null

        // If there was an error from v-select, clear it.
        this.selectedCardError = null

        // Clear previous cc submit error
        this.ccSubmitError = false
      }
      else
      {
        
        this.showCardForm = false
      }
      this.cardFormStyle = style
    },


    updateshipping (obj)
    {
      this.$store.dispatch('updateCheckout', {
        ...this.$store.state.checkout,
         shipping: {
          id: obj.id,
          street: obj.street,
          city: obj.city,
          state: obj.state,
          zip: obj.zip,
          country: obj.country,
        }
      })
    },


    /**
     * User has the option to change crate quantity
     * on the right side of checkout page.
     * 
     * @param {obj} crate - the crate object
     * @param {String} key - the name of the crate
     */

    updateCrate (crate, e)
    { 
      this.$store.commit('cart/UPDATE_CART_ITEM', {
        name: crate.name,
        quantity:  e.target.value
      })
    }, 
   

    /**
     * Makes a section (step) editable again when user
     * clicks the 'edit' link.
     * 
     * @param {String} stepNumber - number of the step we're editing ('one', 'two', etc)
     */
    editStep(stepNumber)
    {      
      this.steps[stepNumber].mode = 'active-step'
    },
  

    /**
     * Goes to next step only if form validates.
     * @param {String} formNumber - number of form ref that called this
     * @param {String} stepNumber - number of step to go to
     */    
    goToNextStep(formNumber, stepNumber)
    {
      // Because form-two is inside a v-if,
      // it won't get checked for validation, and
      // so will always pass. To fix, show
      // the form before going to next step
      if (formNumber == 'two')
      {
        this.showAddressForm = true
      }

      // We need this tick to give vue time to render
      // if we set this.showAddressForm to true in the
      // if condition above.
      this.$nextTick(() => {      
        if (this.$refs[`form-${formNumber}`].validate())
        {        
          this.steps[formNumber].mode = 'completed-step'
          this.steps[stepNumber].mode = 'active-step'
        }
      })
    
    },


    /**
     * Handles payment submission.
     * There are two credit card button payments:
     * One for the v-select, and one for the form.
     * We validate differently depending on which.
     * If it's from the v-select, we must check that
     * there is a value for `selectedCard`
     * If it's from the form, we must verify form with Stripe.
     *
     * @param {String} which - which pay button called this. 
     *   'select' or 'form'
     */
    async handleCreditCardSubmit(which)
    {

      
      this.isSubmitting = true
      var error = false
      var self = this
      var stripeToken
      
      const postData = {
        jwt: this.$store.state.user.jwt,
        orderData: {
          email: this.email,
          guestName: this.$store.state.checkout.guestName,
          shipping: this.$store.state.checkout.shipping,
          crates: this.$store.state.cart.items,         
          // This goes to Stripe
          metadata: {
            name: this.$store.state.checkout.shipping.name,
            address: this.$store.state.checkout.shipping.street,
            city: this.$store.state.checkout.shipping.city,
            state: this.$store.state.checkout.shipping.state,
            zip: this.$store.state.checkout.shipping.zip
          }
          //premium: this.$store.state.checkout.premium
        },
      }
    
     

      // User is paying with a card from the dropdown
      if (which == 'select')
      {
        // Show/hide error message if `selectedCard` is null (no card id)
        if (!this.selectedCard)
        {
          this.selectedCardError = 'Please select a card from the menu above'
          this.isSubmitting = false
          return
        }
        
        postData.cardId = this.selectedCard.id
        postData.stripeId = this.$store.state.user.stripeId       
      }

      else if (which == 'form')
      {       
        try
        {
          // New card, so we must obtain a Stripe Token for it
          var result = await stripe.createToken(cardNumber)
          postData.stripeToken = result.token                 
        }
        catch (e)
        {
          this.isSubmitting = false
          this.ccSubmitError = 'Error acquiring token. Please try again.'
        }

        if (!this.$refs['form-two'].validate() || !postData.stripeToken)
        //if (!this.$refs['form-three'].validate() || !postData.stripeToken)
        {
          this.isSubmitting = false
          error = true
          this.isSubmitting = false
          return
        }  
      }      
    
      this.selectedCardError = null
      this.isSubmitting = false
      
      await axios({
        method: 'post',
        url: `/api/cart/checkout`,
        data: postData,
      })      
      .then( response => {
        if (response.data.result)
        {
          this.$router.replace('/checkout/complete')
          if (this.saveAddress)
          {
            this._saveAddress()
          }
          this.ccSubmitError = null
        }
        else
        {
          this.ccSubmitError = response.data.payload.message
        }
        this.isSubmitting = false
      })
      .catch(error => {
        // TODO log
        console.log(error)
        this.isSubmitting = false
        this.ccSubmitError = 'Could not charge. Please try again.'
      })
    },
    

    /**
     * Adds the shipping address to the user's list.
     * Called when the checkbox is checked.
     */

    async _saveAddress ()
    {
      try
      {
        const address = {
          street: this.$store.state.checkout.shipping.street,
          city: this.$store.state.checkout.shipping.city,
          zip: this.$store.state.checkout.shipping.zip,
          state: this.$store.state.checkout.shipping.state,
          country: this.$store.state.checkout.shipping.country
        }
        
        
        

        let req = await axios({
          method: 'post',
          url: `${window.api}/user/address`,
          headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`},
          data: address
        })

        // The reason we use the response's address instead of the form's,
        // is that response contains the address ID created by the server
        if (req.data.result)
        {
          let addresses = [ ...this.$store.state.user.addresses ]
          addresses.push(req.data.payload.address)
          this.$store.commit('SET_USER_DATA', { addresses })
        }
      }
      catch (e)
      {
        // couldn't inset address into db
      }
    }

  }
}
</script>

<style lang='stylus'> 
  $steps-color = #777
  $steps-inactive-color = #999!important

  .active-step  
    .step-content
      display block

  .inactive-step
  .completed-step
    color $steps-inactive-color  
    .step-content
      display none

  .inactive-step
    background alpha(#fff, 40%)!important
    box-shadow none
    border 1px dashed #ccc!important

  .completed-step    
    .step-number    
      border-color transparent


  .toggle-form
    //background #eee
    overflow auto
    //padding 0.5em 0
    text-align center
    margin 0 auto
    display block
    border-radius 3px
    text-decoration none
    margin-bottom 1em
    font-size 80%
  
  p.hint
    font-size 80%
    color #999
    padding 0.5em  4.2em
    
  .steps
    font-size 1.2em
    
    & > div
      margin-bottom 1em
    
    .step-title
      display flex
      align-items baseline
      justify-content space-between
      font-size 120%
      a
        font-size 80%
    .step-number
      display inline-block
      border 1px solid $steps-color
      margin 0 1em 0 0
      width 2em
      height 2em
      line-height 2em
      border-radius 20px
      text-align center
      font-size 80%
    .step-content
      //padding-top 1em
      small
        display none
        font-size 65%
        color lighten($steps-color, 10%)       

    button
      margin-top 2em
    
  #cc-errors
    display none


  .stripe-field
    background rgba(238, 238, 238, 0.35)
    padding 8px 5px 

  .summary
    //font-size 1em
    //background rgba(228, 227, 227, 0.2)
    //padding 1em 2em
    //border-radius 5px
    color #444
    .card__text > div
      margin-bottom 1.4em
    h5
      font-size 140%
      font-weight normal
      //border-bottom 1px solid #ccc
      text-align  center
      margin-bottom 1em
    h6
      font-size 1em
      margin-bottom 7px
      font-weight bold    
    
    .summary-items
      line-height 32px
    .input-group
      padding-top 0
    
    input
      border-bottom 1px solid #ccc
      padding 0 10px
      max-width 55px
      text-align center
      margin 0 5px
      color $blue
      line-height 15px
      font-size 1.2em


  .address-check
    text-align center
    background #eeeeee29
    padding 0.2em 0
    margin-top 1.5em
    border 1px dashed #ccc
    display none

  .input-error
    color #ff5252
    font-weight light

  
    
  .cardform-container
    margin-top 1em
    //background rgba(0,128,0,0.11)
        
    
  .cardform 
    background #fff
    label
      position: relative;
      color #8a8a8a //#8898AA;
      display block
      font-weight 300
      font-size 85%
      & > :first-of-type
        color #666
        padding-bottom 3px
        font-weight bold
  

  label span.icon     
    position absolute
    top 31px
    right 10px
</style>