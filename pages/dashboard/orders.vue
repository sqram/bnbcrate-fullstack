<template>

  <v-container>
          
      <header>
        <h3>Your Order History</h3>       
      </header> 
      <v-container>
        <div v-if="isFetching">
          <loading />
        </div>  

        
        <v-layout wrap >        
          <div v-if='orders && orders.length'>
            <v-flex xs6 sm3 v-for='(order, i) in orders' :key='i' class="order" >        
              <v-card >
                <v-card-text>                
                    <div class="date">{{ order.date }}</div>
                    <div class="items">
                      <div v-for='(o, key) in order.items' :key='key'>
                        {{ o[1] }} {{o[0]}}
                      </div>
                    </div>
                    <div class="addr">
                      {{ order.address }}
                    </div>                
                </v-card-text>
              </v-card>
            </v-flex>
          </div>
          <div v-else style="width: 100%">
            <h4 class="text-xs-center">You haven't placed any orders yet :(</h4>            
          </div>
        </v-layout>
      </v-container>
        

  </v-container>
</template>
<script>
import axios from 'axios'
import Loading from '~/components/Loading'

export default {
  components: {
    Loading,
  },
  data ()
  {
    return {
      isFetching: true,
      orders: null
    }
  },

  async mounted ()
  {
    
    const req = await axios({
      method: 'get',
      url: `${window.api}/user/orders`,
      headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`}
    })

    if (req.data.result)
    {
      this.orders = req.data.payload.orders      
    }
    
    this.isFetching = false
  }

  
}
</script>

<style lang='stylus' scoped>
  .order
    margin-bottom 1em
    
  .date
  .items
    margin-bottom 1em
  .date
    color $blue
    font-weight bold
  .addr
    border-top 1px solid #eee
    padding-top 0.6em
  h4
    font-weight 100
    font-size 2.4em
    color #555
    width 100%
    
</style>

