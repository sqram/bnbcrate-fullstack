<template>
  <div>
    
    <v-snackbar 
      v-model='formdata.show' :color='formdata.color'
      :timeout='4000'
      :absolute='false'
      :top='true'>
      {{ formdata.text }}
      </v-snackbar>
    <v-form ref="newAddressForm" class="new-address-form">
      <v-card-text>             
        <v-text-field    
          label="Address"
          v-model='street'
          :rules="rules.street"
          required
          class="input-group">            
        </v-text-field>
      </v-card-text>

      <v-card-text>
        <v-text-field    
          label="City"
          v-model='city'
          :rules="rules.city"
          required
          class="input-group">            
        </v-text-field>
      </v-card-text>

      <v-card-text>
        <v-select
          :items="states"
          :rules='rules.state'
          v-model="state"
          label="Select State"
          single-line
          required          
        ></v-select>
      </v-card-text>

      <v-card-text>
        <v-text-field    
          label="Zip"
          v-model='zip'
          :rules="rules.zip"
          required
          class="input-group">            
        </v-text-field>        
      </v-card-text>

        <v-layout>
          <v-flex xs11>
            <v-card-text>
              <v-btn
                block
                color='secondary'
                large
                :loading='isSubmitting'
                @click='handleSubmit'>
                SAVE ADDRESS
              </v-btn>
            </v-card-text>
          </v-flex>
          <v-flex>
            <v-card-text>
              <v-btn          
                color='error'
                large
                @click="$emit('update', false)">
                cancel
              </v-btn>
            </v-card-text>
          </v-flex>
        </v-layout>
    </v-form>    
  </div>
</template>

<script>
  import axios from 'axios'
  import { isInt, isLength } from 'validator'
  export default {
    data()
    {
      return {
        isSubmitting: false,
        formdata: {
          show: 0,
          text: null,
          color: null,
        },
        street: "",
        city:  "",
        zip: "",
        state: "",
        country: 'us',
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
       
      }
    },
    mounted()
    {
      
    },
    methods: {    
      async handleSubmit()
      {
        this.isSubmitting = true
        
        if (!this.$refs.newAddressForm.validate())
        {
          this.isSubmitting = false
          return
        }

        const address = {
          street: this.street,
          city: this.city,
          zip: this.zip,
          state: this.state,
          country: this.country
        }

        await axios({
          method: 'post',
          url: `/api/user/address`,
          headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`},
          data: address
        })
        .then(res => {
          if (res.data.result)
          {
            this.formdata.color = 'success'          
            const user = {...this.$store.state.user, addresses: [...this.$store.state.user.addresses]}
            user.addresses.push(res.data.payload.address)                 
            this.$store.commit('SET_USER_DATA', user)
          }
          else
          {          
            this.formdata.color = 'error'
          }
          this.formdata.show = 1
          this.formdata.text = res.data.payload.message
          this.isSubmitting = false
        })
        .catch(e => {
          this.isSubmitting = false
        })        
      }
    }
  }
</script>


<style lang="stylus">
  .new-address-form
    margin-bottom 2em
    background white
</style>
