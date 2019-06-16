<template>

  <v-container>
          
      <header>
        <h3>Your Order History</h3>       
      </header> 
      
      <v-layout>

        <div v-for='(order, i) in orders' :key='i' if='orders.length'>
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
         

    
      </v-layout>
        

  </v-container>
</template>
<script>
import axios from 'axios'


export default {
  
  data ()
  {
    return {
      orders: []
    }
  },

  mounted ()
  {
    alert(5)
  //   const req = await axios({
  //     method: 'get',
  //     url: `${window.api}/user/order-history`,
  //     headers: {'Authorization': `Bearer ${this.$store.state.user.token}`}
  //   })

  //   if (req.data.result)
  //   {
  //     this.orders = req.data.payload.orders
  //   }
    
  //   this.isFetching = false
  }

  
}
</script>

<style lang='stylus' scoped>
  .card
    margin-bottom 1.2em
    &:last-of-type
      margin-bottom 0 
</style>

