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
        <h3>Shipping Addresses</h3>
        <p>
          Create addresses for a quicker checkout.<br>
          You'll be able to select your addresses from a list
          on the checkout process.
        </p>
        <div style="text-align:center">
            <v-card-text style="margin: 0 auto">
              <v-btn color='primary' @click.native.stop="showNewAddressForm = true">add new address</v-btn>
            </v-card-text>    
          </div>                
      </header> 

    
      
       
      <div v-if='showNewAddressForm'>
        <FormNewAddress  @update='showNewAddressForm = false' />
      </div>

      <div v-if='addresses.length'>
        <div v-for='(address, i) in addresses' :key='i'>
          <v-card flex  xs12>
            <v-card-text >
              <div @click='toggleEditForms(i)' class="address-preview">
                <span>
                  {{ $store.state.user.addresses[i].street }},
                  {{ $store.state.user.addresses[i].city }},
                  {{ $store.state.user.addresses[i].zip }}                  
                </span>

              </div>
              <v-form v-if='editForms[i]' class="edit-form">
                <v-layout wrap>
                  <v-flex d-flex xs12>
                    
                    <v-card-text>
                      <v-text-field 
                      label="Address" 
                      required
                      :rules='rules.street'
                      v-model='addresses[i].street'
                      :value='addresses[i].street'>
                      </v-text-field>
                    </v-card-text>
                  </v-flex>              
                </v-layout>

                <v-layout row wrap>
                  <v-flex  xs12 sm4>
                    <v-card-text>
                      <v-text-field
                        label="City"
                        required
                        :rules='rules.city'
                        v-model='addresses[i].city'
                        :value='addresses[i].city'>
                      </v-text-field>
                    </v-card-text>
                  </v-flex>
                  <v-flex  xs12 sm4>
                    <v-card-text>
                      <v-select
                        label="State"
                        :rules='rules.state'
                        v-bind:items='states'
                        v-model='addresses[i].state'
                        :value='addresses[i].state'                        
                        single-line
                        required                          
                        hide-details                          
                      ></v-select>
                    </v-card-text>
                  </v-flex>
                  <v-flex xs12 sm4>
                    <v-card-text>
                      <v-text-field 
                      label="Zip" 
                      required 
                      :rules='rules.zip'
                      v-model='addresses[i].zip'
                      :value='addresses[i].zip'>
                      </v-text-field>
                    </v-card-text>
                  </v-flex>
                  <v-flex>
                    <v-card-actions>
                      <v-btn color="" @click='updateAddr($store.state.user.addresses[i].id, i)'>Save</v-btn>
                      <v-btn
                        color=""
                        @click='deleteAddr($store.state.user.addresses[i].id, i)'>
                        Delete
                      </v-btn>
                      <v-btn
                        color=""
                        @click='toggleEditForms(i)'>
                        cancel
                      </v-btn>
                    </v-card-actions>
                  </v-flex>
                </v-layout>
              </v-form>     
            </v-card-text>
          </v-card>
        </div>
      </div>

      <v-card flat v-else class="no-address">
        You have no addresses saved.          
      </v-card>
        
  </v-container>
</template>


<script>
// https://stackoverflow.com/questions/41663010/update-parent-model-from-child-component-vue

import axios from 'axios'
//import Loading from '../../components/Loading'
import FormNewAddress from '../../components/FormNewAddress'
import { isLength } from 'validator'
//import { mapState } from 'vuex'

export default {
  components: {
    //Loading,
    FormNewAddress
  },
  data()
  {
    return {

      //isFetching: true,
      showNewAddressForm: false,
      editForms: {},
      snackbar: {
        show: 0,
        text: null,
        color: null,
      },
      //addresses: [...this.$store.state.user.addresses],
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
      rules: {        
        street: [
          v => isLength(v, { min: 2 }) || 'Street address is required.'
        ],
        zip: [
          v => /[0-9a-zA-Z]+/i.test(v) || 'Enter a valid zip code (at least 5 digits)'
        ],
        city: [
          v => isLength(v, { min: 1 }) || 'Enter a valid city.'
        ],
        state: [
          v => isLength(v, { min: 2, max: 2 }) || 'Must be two letters.'
        ]
      }
    }
  },

  

  methods: {   
    toggleEditForms(i)
    {
      this.editForms = { 
        ...this.editForms,
        [i]: !this.editForms[i]
      };
    },


    /**
     * Updates a user's address
     */
    
    async updateAddr(id, index)
    {
      let address = this.addresses[index]

      // Does this address exist in our store? Check for the ID
      let storeAddress = this.$store.state.user.addresses.filter(a => a.id == id)[0] || null
      
      if (!storeAddress)
      {
        this.snackbar.show = 1
        this.snackbar.text = "Unknown error"
        this.snackbar.color = 'error'       
        return
      }   

      
      let req = await axios({
        method: 'put',
        url: `${window.api}/user/address/`,
        headers: { Authorization: `Bearer ${this.$store.state.user.jwt}` },
        data: { address }
      })

      if (req.data.result)
      {
        this.snackbar.show = 1
        this.snackbar.text = req.data.payload
        this.snackbar.color = 'success'

        // Update address in the state.user in place so view doesnt't shift
        let userData = Object.assign({}, this.$store.state.user)        
        let addresses = userData.addresses
        var addressesClone = [...addresses]
        addresses.forEach((addr,i) => {
          if (addr.id == id)
          {             
            addressesClone[i] = address
          }
        })        
        
        this.$store.commit('SET_USER_DATA', {addresses: addressesClone})

      }
      else
      { 
        if (req.data.payload.code == 'NO_USER')      
        {
          //return this.$router.push('/')
        }
        this.snackbar.show = 1
        this.snackbar.text = req.data.payload.message
        this.snackbar.color = 'error'        
      }    
    },


    /**
     * Deletes an address
     */

    async deleteAddr(id)
    { 
     
      const req = await axios({
        method: 'delete',
        url: `${window.api}/user/address/?id=${id}`,
        headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`}        
      })
      
      if (req.data.result)
      {
        this.snackbar.show = 1
        this.snackbar.text = req.data.payload.message
        this.snackbar.color = 'success'        
        this.$store.commit('SET_USER_DATA', {
          addresses: req.data.payload.addresses
        })
        
      }        
    },

  },
  
  beforeMount() {
    
  },
  computed: {
    addresses ()
    {
      return JSON.parse(JSON.stringify(this.$store.state.user.addresses.slice(0)))
    }
  },
  
}
</script>

<style lang='stylus' scoped> 
  .newAddressForm
    background white

  .no-address
    font-size 2em
    color #555    
    padding 3vmax
    text-align center
    border 1px dashed darken(#eee,5%)
    margin-top 2em
    & .card__text
      padding-bottom 0
  
  .card
    width 100%
    margin-bottom 1em
  .address-preview
    padding 1em
    color #777
    cursor pointer
    &:hover
      background #eee
    & > span
      border-bottom 1px dotted $blue

    .edit-form
      padding 1em

  
</style>