<template>
  <div>
    <div>
      <!--
      <v-btn color="primary" large block>Continue with Facebook</v-btn>
      <v-btn color="accent" large block>Continue with Google</v-btn>
      -->
    </div>
    
    
    <v-form ref="registerForm">
        <v-text-field
          label='E-mail'
          :rules="rules.email"
          v-model='email'
          persistent-hint>
        </v-text-field>              
      
        <v-text-field
          label='Password'
          :rules="rules.password"
          v-model='password'
          type='password'
          persistent-hint>
        </v-text-field>                  

        <v-btn
          class="primary"
          block
          large
          :loading='isSubmitting'
          @click='handleSubmit'>
          LOG IN
        </v-btn>

        <v-alert color="error" icon="warning" value="true" v-if='error'>
          {{ error }}
        </v-alert>
    </v-form>
    
  </div>
</template>

<script>
  import Axios from 'axios'
  import { isEmail, isLength } from 'validator'
  
  // const axios = new Axios({
  //   baseURL: 'https://some-domain.com/api/',
  //   timeout: 1000,
  //   headers: {'X-Custom-Header': 'foobar'}
  // })

  export default {
    data()
    {
      return {
        email: '',
        password: '',
        error: "",
        isSubmitting: false,
        rules: {
          email: [
            v => !!v || 'E-mail is required',
            //v => isEmail(v) || 'This e-mail is not valid'
          ],
          password: [
            v => !!v || 'Password is required',
            //v => isLength(v, { min: 4 }) || 'Passwords must be at least 4 characters'
          ]
        },
      }
    },

    methods: {

      /*
       * This handles submitting the form with an email
       * and password. Not facebook or google
       */
      
      async handleSubmit()
      {
        this.isSubmitting = true
                
        if (!this.$refs.registerForm.validate())
        {
          this.isSubmitting = false
          return
        }       

        this.isSubmitting = false
        
        this.$axios.$post(`/user/login`, {
          email: this.email,
          password: this.password          
        })
        .then( response => {
          if (response.data.result)
          {
            this.$store.dispatch('dialogs/toggleDialog', {
              dialogKey: 'auth',
              show: false
            })

            // const user = {
            //   jwt: response.data.payload.jwt,
            //   id: response.data.payload.id,
            //   stripeId: response.data.payload.stripeId,
            //   email: response.data.payload.email,
            //   addresses: response.data.payload.addresses,
            //   //cards: response.data.payload.cards
            // }            
            
            this.$store.commit('dialogs/SET_USER_DATA', response.data.payload)         
            
            
            
            // Redirect
            //this.$router.push('/dashboard')
          }
          else
          {
            this.error = response.data.payload.message
          }

          this.isSubmitting = false
        })
        .catch(error => {
          this.isSubmitting = false
        });
      
      }
    }
  }
</script>
