<template>
  <v-container grid-list-md>

    <header>
      <h3>Reset password</h3>        
    </header> 

    <v-layout column wrap>      
      <div v-if='form == "forgot"'>
        <v-form ref="forgotForm" lazy-validation>
        <v-flex xs10 md6 offset-xs1 offset-md3>
          <p>
            Enter your e-mail below and we'll send you a link
            to reset your password
          </p>
        </v-flex>
        
        <v-flex xs10 md6 offset-xs1 offset-md3>          
          <v-text-field
            box
            label="Email address"
            type='email'
            required
            v-model="email"          
            append-icon="email"
            :rules="[rules.email.regex]"
          ></v-text-field>
        </v-flex>
        <v-flex xs10 md6 offset-xs1 offset-md3>
          <v-btn
            large
            block
            class="primary"
            :loading='isSubmitting'
            @click='submitForgot'
            >SUBMIT</v-btn>
        </v-flex>
        <v-flex xs10 md6 offset-xs1 offset-md3>
          <v-alert type="success" :value="true" v-if='forgotSuccess'>
            <h4>E-mail sent!</h4>
            <div>
              You should receive an email shortly with a link
              to reset your password.<br>
              If you don't receive it,
              try again, making sure you enter your email correctly.
            </div>
          </v-alert>
        </v-flex>
        </v-form>
      </div>

      <div v-else>
        <v-form ref="resetForm" lazy-validation>
          <v-flex xs10 md6 offset-xs1 offset-md3>
            <p>
              Enter your new password below
            </p>
          </v-flex>
          <v-flex xs10 md6 offset-xs1 offset-md3>          
            <v-text-field
              box
              label="Your account email"
              type='email'
              v-model="email"          
              append-icon="email"
              :rules="[rules.email.regex]"
            ></v-text-field>
          </v-flex>
          <v-flex xs10 md6 offset-xs1 offset-md3>          
            <v-text-field
              box
              label="New password"
              type='text'
              v-model="pw1"          
              append-icon="lock"
              :rules="[rules.password.regex]"          
            ></v-text-field>
          </v-flex>
          <v-flex xs10 md6 offset-xs1 offset-md3>          
            <v-text-field
              box
              label="Confirm new password"
              type='text'
              v-model="pw2"          
              append-icon="lock"
              :rules="[rules.password.regex]"          
            ></v-text-field>
          </v-flex>
          <v-flex xs10 md6 offset-xs1 offset-md3>
            <v-btn
              large
              block
              class="primary"
              :loading='isSubmitting'
              @click='submitReset'
              >UPDATE PASSWORD</v-btn>
          </v-flex>
          <v-flex xs10 md6 offset-xs1 offset-md3>
           

            <v-alert :type="xhr.status" :value="xhr.result != null">
              {{ xhr.message }}
            </v-alert>
                
          </v-flex>
        </v-form>
      </div>


    </v-layout>
  </v-container>
</template>

<script>
  import axios from 'axios'
  export default {
    data () {
      return {
        form: 'forgot',
        isSubmitting: false,
        isSubmitted: false,
        pw1: null,
        pw2: null,
        email: null,
        forgotSuccess: null,
        xhr: {
          result: null,
          message: 'Success!',
          status: 'success'
        },        
        rules: {
          email: {
            regex: v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
          },
          password: {
            regex: v => !!v && v.length >= 4 || 'Must be at least 4 characters.'            
          }
        },
        
      }
    },
    beforeMount ()
    {    
     if (this.$store.state.user.jwt)
      {
        this.$router.push('/')
      }
      // If there's a hash in url, user is coming from email,
      // ready to reset
      if (this.$route.hash)
      {
        this.form = 'reset'
      }
      else
      {
        this.form = 'forgot'
      }
      
      
    },
    methods: {
      async submitForgot ()
      {
        if (this.$refs.forgotForm.validate())
        {          
          this.isSubmitting = true
          var req = axios({
            method: 'post',
            url: `${window.api}/reset-password`,
            data: { email: this.email, form: 'forgot' }
          })
          .then(r => {
            this.isSubmitting = false
            if (r.data.result)
            {
              this.forgotSuccess = true       
            }
            else
            {
              
            }          
          })
          .catch(e => {
            this.isSubmitting = false
          })
        }
      },


      async submitReset ()
      {

        if (this.pw1 != this.pw2)
        {
          this.xhr.result = 1
          this.xhr.message = 'Passwords do not match!'
          this.xhr.status = 'error'
          return
        }
          

        if (this.$refs.resetForm.validate())
        {
          this.isSubmitting = true
          axios({
            method: 'post',
            url: `${window.api}/reset-password`,
            data: {
              email: this.email,
              password: this.pw1,
              form: 'reset',
              hash: this.$route.hash
            },
          })
          .then(r => {
            this.isSubmitting = false
            this.xhr.result = r.data.result
            this.xhr.message = r.data.payload.message
            this.xhr.status = r.data.result ? 'success' : 'error'            
            if (r.data.result === 1)
            {
              // Password reset succeeded
              // Try to log the user in.
              axios.post(`${window.api}/user/login`, {
                email: this.email,
                password: this.pw1          
              })
              .then( response => {
                if (response.data.result)
                {               
                  this.$store.dispatch('setUserData', response.data.payload)                                     
                  this.$router.push('/dashboard')
                }
                else
                {
                  this.xhr.result = 1
                  this.xhr.message = 'Password reset succeeded.'
                  this.xhr.status = 'success'
                }
                this.isSubmitting = false
              })
              .catch( () => {
                // Password reset OK. But could not log user in.
                // User doesn't need to know we tried to log them in.
                // So let them know password is reset
                this.xhr.result = 1
                this.xhr.message = 'Password reset succeeded.'
                this.xhr.status = 'success'
              })

            }
            else
            {
              

            }
            
          })
          .catch(e => {
            this.isSubmitting = false               
          })
        }
      }
    }
  }
</script>

<style lang='stylus' scoped>    
  p
    text-align center
    font-size 110%
</style>

