<template>
  <v-container>    
      <header>        
        <h3 class="display-1">Success. Order Complete!</h3>       

        <v-card>
          <v-card-text>
            thank you,
            <h2>{{ $store.state.checkout.email }}</h2>
            
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-text>
            <v-card-text>              
              <p>
                An e-mail has been sent with an order confirmation. <br> 
                A fresh crate is now being prepared, and will soon be shipped to address you provided.
              </p>
              <h3>Your future guest thanks you!</h3>
            </v-card-text>
          </v-card-text>          
        </v-card>
        
      </header>
<!--         
        <v-layout>
          <v-flex xs8 offset-xs2>
            <v-card>
              <v-card-text>
                <v-card-text>
                <h3>Would you like to create an account?</h3>
                <p>                  
                  Creating an account lets you check out quicker by not
                  having to enter your information every time.
                </p>                
                <FormRegister />
                </v-card-text>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout> -->
        
      
        
    

    
  </v-container>
</template>

<style lang="stylus" scoped>
  header > h3    
    margin-bottom 1em
</style>

<script>

//import FormRegister from '../../components/FormRegister'

export default {
  /*
  components: {
    FormRegister
  },
  beforeMount()
  {
    // TODO check if there are 0 crates. redirect
  },
  
  mounted ()
  {
    // Set every crate's quantity to 0, so it's not
    // pre-filled next checkout
  
    for (let key in this.$store.state.crates)
    { 
      this.$store.commit('UPDATE_CRATE', {
        crate: key,
        quantity: key == 'shower'  ? 1 : 0
      })
    }
    
    
  }
  */
}
</script>

