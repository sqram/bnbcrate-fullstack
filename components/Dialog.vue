<template>

  <v-dialog v-model="show" max-width="700px">
    
  <div v-if="content == 'login'">
    <v-card>
      <v-card-title column style='flex-direction: column'>
      <div class="headline">Login to your account</div>    
    </v-card-title>    
    </v-card>
    <v-card>
      <v-card-text>
        <FormLogin />          
        <v-flex class="text-xs-right">
          <v-btn flat small color="secondary" to='/reset-password' @click='show = false'>Forgot password?</v-btn>
          <v-btn small  flat color='secondary'  @click.prevent='toggleDialog("register")'>Don't have an account? Create one!</v-btn>
        </v-flex>                        
      </v-card-text>       
    </v-card>
  </div>


  <div v-if="content == 'register'">
    <v-card>
      <v-card-title column style='flex-direction: column'>
        <div class="headline">Create your account!</div>             
      </v-card-title>
    </v-card>
    <v-card>
      <v-card-text>
        <FormRegister />
        <v-flex class="text-xs-right">
          <v-btn small flat color='secondary'  @click.prevent='toggleDialog("login")'>Already have an account? Log in!</v-btn>
        </v-flex>       
      </v-card-text>
    </v-card>
  </div>
  
  </v-dialog>
</template>


<script>
  import FormRegister from './FormRegister'
  import FormLogin from './FormLogin'
  
  

  export default {
    components: {
      FormRegister,
      FormLogin
    },
    
    computed: {
      show: {
        get ()
        {
          return this.$store.state.dialogs.show
        },
        set (flag)
        {
          this.$store.dispatch('dialogs/toggleDialog', { })
        }        
      },
      content: {
        get ()
        {
          return this.$store.state.dialogs.content
        },
        set (content)
        {
          this.$store.dispatch('dialogs/toggleDialog', { content })
        }
      }
    },
    
    
    methods: {
    
      /**
       * Updates the dialog component by showing/hiding,
       * and/or changing its contents
       * 
       * @param {str} content: 'login', 'register', 'newAddress', etc
       */

      toggleDialog (content)
      {
        this.$store.dispatch('dialogs/toggleDialog', { show: true, content })      
      }      
    }
 
  }
</script>


