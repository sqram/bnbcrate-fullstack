<template>
  <div>
   
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
          Create Account
        </v-btn>

        <v-alert color="error" icon="warning" :value='error'>
          <span v-html='error'></span>
        </v-alert>
    </v-form>
    
  </div>
</template>

<script>
  import axios from 'axios'
  import { isEmail, isLength } from 'validator'
  

  export default {
    data()
    {
      return {
        error: null,
        email: this.$store.state.email || '',
        password: '',
        isSubmitting: false,
        rules: {
          email: [
            v => !!v || 'E-mail is required',
            v => {
              return isEmail(v) || 'This e-mail is not valid'
            }
          ],
          password: [
            v => !!v || 'Password is required',
            v => isLength(v, { min: 4 }) || 'Passwords must be at least 4 characters'
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

        try
        {
          const req = await axios({
            method: 'post',
            url: `/api/user/register`,
            headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`},
            data: { email: this.email, password: this.password }
          })
          
          if (req.data.result)
          {            
            this.$store.commit('user/SET_USER_DATA', req.data.payload)                      
            this.$store.commit('dialogs/TOGGLE_DIALOG', {
              show: false,
            })
            this.$router.push('/dashboard')            
          }
          else
          {
            this.error = req.data.payload.message
          }
        }
        finally
        {
          this.isSubmitting = false
        }
      }
      
    }
  }
</script>