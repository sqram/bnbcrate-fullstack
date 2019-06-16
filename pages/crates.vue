<template>
    
  <div>
    <v-container grid-list-xl >
      <header>
        <h3 class="display-1" >Select Your Crates</h3>
        <p>
          Select the quantity of each
          crate you'd like us to ship
        </p>  
      </header>

      <v-layout row wrap>
        
        <!-- Left side - Crate Selection -->
        <v-flex xs12 sm8 md8 lg6 offset-lg1>
          <v-layout row wrap>
      
            <v-flex d-flex xs12 v-for="crate in $store.state.products.crates" :key='crate.name'>
              <v-card>
                <v-layout class="crate-selection">

                  <!-- count -->
                  <v-flex xs4 md3>
                    <v-card-text>
                      <NumberInput :crate-name="crate.name" :crate-id='crate.id' :crate-price='crate.price' />
                    </v-card-text>
                  </v-flex>

                  <!-- description -->
                  <v-flex xs8 md9 class="crate-info">                
                    <v-card-text>
                      {{ crate.name }} crate
                      <small>
                        <span v-for="(item, k, i) in crate.items" :key='i'>
                          <span>{{item}}</span>
                          <!-- don't show last &mdash; -->
                          <span v-if="k+1 < Object.keys(crate.items).length">
                            &mdash;
                          </span>
                        </span>                     
                      </small>   
                    </v-card-text>                 
                  </v-flex>
                </v-layout>                    
              </v-card>
            </v-flex>

           
          </v-layout>
        </v-flex>

        <!-- Right side -->
        <v-flex xs12 sm4  md4 lg4>
          <v-card class="green lighten-2" dark>
            <v-card-text>
              <div class="order-summary">           
                <div class="price">
                  <span class="currency">$</span>{{ $store.getters['cart/cartTotal'] }}
                </div>
                 <v-btn block large to="/checkout" :disabled="$store.getters['cart/cartTotal'] == 0" class="blue">OK, SHIP!</v-btn>
                 <div style="text-align:center">
                 <v-card-text>
                   (Shipping is <b>FREE</b>)
                   </v-card-text>
                 </div>
              </div>
              
              <!--
              <v-card dark class="premium">
                <div class="corner topleft"></div>
                <div class="corner topright"></div>
                <div class="corner bottomleft"></div>
                <div class="corner bottomright"></div>
                <v-card-text>
                  <v-switch label="Use Premium crates?" 
                    dark
                    v-model="$store.state.premium"
                    @change="$store.dispatch('togglePremium')"
                    color="primary"
                    hide-details>  
                  </v-switch>
                  <p>
                    Crates will be black with golden corners.<br>
                    Perfect for the business or executive guest. (+ $1)
                  </p>
                </v-card-text>
              </v-card>
              -->
            </v-card-text>
          </v-card>
        </v-flex>
    
      </v-layout>
    </v-container>

  </div>
</template>

<script>

import NumberInput from '~/components/NumberInput'


export default {
  layout: 'default',
  components: {
    NumberInput
  },

  async beforeMount () {
    this.$store.dispatch('products/getCrates') 
  }  
}
</script>

<style lang='stylus'>
    
  .container.order-form
    margin-top 5em

  .crate-selection
    font-size 2.3em
    color #444 
    small
      font-size 40%
      display block
      position relative
      line-height 20px
      color #777
      letter-spacing 0.5px
      span
        span:nth-of-type(even)
          color cadetblue
      @media $xs
        line-height inherit
        font-size 60%
        color #999
        
        
  div.crate-info
    margin-left 0.4em
    display inline-block
    vertical-align top
    @media $xs
      margin-left 84px
      font-size 24px
    
  .order-summary
    background rgba(228, 227, 227, 0.2)
    padding 2em
    border-radius 10px
    color #fff
    .price
      font-size 4em
      text-align center
      //color $salmon
    .currency
      font-size 60%
      position relative 
      top -19px
    
    @media $xs
      padding 1em
      .price
        color inherit
        font-size 2.5em
        .currency
          font-size 50%
      
  .premium
      margin-top 1em
      position relative
      p
        padding 9px 0
        color #ccc
      div.corner
        width 20px
        height 20px
        position absolute
        border-width 3px
        border-color gold
        border-style solid
        &.topleft
          top 0
          left 0
          border-right none
          border-bottom none
        &.topright
          top 0
          right 0
          border-left none
          border-bottom none
        &.bottomright
          bottom 0
          right 0
          border-left none
          border-top none
        &.bottomleft
          bottom 0
          left 0
          border-right none
          border-top none
</style>
