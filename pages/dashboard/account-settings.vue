<template>

  <v-container grid-list-xl>

    <v-snackbar 
      v-model='snackbar.show' :color='snackbar.color'
      :timeout='4000'
      :absolute='false'
      :top='true'>
      {{ snackbar.text }}
    </v-snackbar>


    <header>
      <h3>Account Settings</h3>       
    </header> 
  
    <v-layout row wrap>

      <v-flex sm10 offset-sm1>
        <h3>Change password</h3>
        <v-form v-model="passwordFormValid" ref="form" lazy-validation>
          <v-card light>
            <v-card-text>
              <v-text-field
                box
                label="Current password"
                type='email'
                required
                v-model="currentPassword"          
                append-icon="lock"
                :rules="[rules.required]"
              ></v-text-field>

              <v-text-field
                box
                label="New password"
                required
                v-model="newPassword1"
                :type="hidePassword ? 'password' : 'text'"              
                :error-messages='mismatchError'
                @keyup="checkForPasswordMismatch"
                :append-icon="hidePassword ? 'visibility_off' : 'visibility'"
                :append-icon-cb="() => (hidePassword = !hidePassword)"              
              ></v-text-field>

              <v-text-field
                box
                label="Retype new password"
                required
                v-model="newPassword2"              
                :type="hidePassword ? 'password' : 'text'"     
                @keyup="checkForPasswordMismatch"
                :error-messages='mismatchError'
                :append-icon="hidePassword ? 'visibility_off' : 'visibility'"
                :append-icon-cb="() => (hidePassword = !hidePassword)"                                 
              ></v-text-field>        
            </v-card-text>          
            <v-card-text>
              <v-btn 
                block
                color='primary'
                :loading='isSubmitting'
                @click='updatePassword'>SAVE</v-btn>
            </v-card-text>
          </v-card>
        </v-form>
      </v-flex>

      <!--
      <v-flex sm10 offset-sm1>
        <v-card  color="" flat>          
          <v-btn to='/dashboard/credit-cards' color='white' large block class='margin'>Manage Credit Cards</v-btn>          
        </v-card>
        
        <v-card flat>          
          <v-btn to='/dashboard/addresses' color='white' large block class="margin">Manage Shipping Addresses</v-btn>          
        </v-card>

        <v-card  flat>          
          <v-btn to='/dashboard/orders' color='white' large block class="margin">View Order History</v-btn>          
        </v-card>        
      </v-flex>
      -->

      <v-flex sm10 offset-sm1>
        <v-card>
          <v-card-text>
            <v-switch 
            color='primary'
            :label="`Receive updates &amp; offers via email?`" 
            hide-details
            @change='updateEmailPreference'
            v-model='preferences.receiveEmails'
            >
          </v-switch>
          </v-card-text>
        </v-card>
      </v-flex>
      
    </v-layout>
  </v-container>


</template>
<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
    data () {
      return {       
        isSubmitting: false,        
        
        // password related vars
        hidePassword: true,
        currentPassword: null,        
        newPassword1: null,          
        newPassword2: null,
        newPassword1Activated: false,
        passwordFormValid: true,
        mismatchError: [],
        rules: {
          required: (value) => !!value || 'Required.',
        },
        snackbar: {
          show: 0,
          text: null,
          color: null,
        },
      }
    },

    computed: {
      preferences: {
        get () {
          return Object.assign({}, this.$store.state.user.preferences)
        },
        set (v) {
          //this.$store.state.user.preferences = Object.assign({}, this.$store.state.user.preferences)
        }
      }
    },

    methods: {
      checkForPasswordMismatch ()
      {
        if (this.mismatchError.length && this.newPassword1 != this.newPassword2)
        {
          this.mismatchError.push('New passwords do not match')          
        }
        else
        {
          this.mismatchError = []
        }
      },


      /**
       * Make API call to update user's password.
       * 
       * @postparam {str} currentPassword - user's current pw
       * @postparam {str} new - user's new password
       * @postparam {str} new2 - new password confirmation (prevent typo)
       */

      async updatePassword()
      { 
        if (this.newPassword1 != this.newPassword2)
        {
          this.mismatchError.push('New passwords do not match')
          return
        }        
        
        if (this.$refs.form.validate())
        {
          this.mismatchError = []          
          this.isSubmitting = true
          try
          {
            const req = await axios({
              method: 'post',
              url: `${window.api}/user/update-password/`,
              headers: {Authorization: `Bearer ${this.$store.state.user.jwt}`},
              data: { 
                current: this.currentPassword,
                new: this.newPassword1, 
                new2: this.newPassword2
              }            
            })
            this.snackbar.show = 1
            this.snackbar.text = req.data.payload.message
            this.snackbar.color = req.data.result ? 'success' : 'error'
          }        
          finally
          {
            this.isSubmitting = false
          }
          
          
        }         
      },


      /**
       * API call to update user's email preference.
       * 
       * @postparam {str} 
       */

      updateEmailPreference ()
      {    
        this.$store.dispatch('updatePreferences', this.preferences)
        axios({
          method: 'post',
          url: `${window.api}/user/preferences`,
          headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`},
          data: {preferences: this.preferences},
        })
        .then(res => {})
        .catch(e => {          
          this.preferences.receiveEmails = !this.preferences.receiveEmails
          this.$store.commit('UPDATE_PREFERENCES', this.preferences)
        })        
      }
    }

}
</script>

<style lang='stylus' scoped> 
  h3
    margin-bottom 1em

  .margin
    margin-bottom 2em

  .card a    
    color #666
    margin-bottom 1.3em
    padding 2em
</style>