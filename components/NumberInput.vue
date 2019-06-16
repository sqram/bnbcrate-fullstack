<template>
  <div class="input-wrapper">
    <input type="number" 
      :data-crateName=crateName
      v-model.number="itemCount">
    <div class="arrows-wrapper">
      <div class="arrow-up" @click="changeValue('increment', $event)">
        +
      </div>
      <div class="arrow-down" v-on:click="changeValue('decrement', $event)">
        -
      </div>
    </div>
  </div>
</template>



<style lang='stylus'>
 
  .input-wrapper
    border 1px solid #ccc
    display inline-block
    position relative
    width 110px
    background #fcfcfc
    overflow hidden

  input[type="number"]
    border none
    padding 0.21em  0.4em
    font-size 1.3em
    width:100%
    color $blue
    &:focus
      outline none      

  .arrows-wrapper 
    position absolute
    right 0
    top 0
    bottom 0
    width 40px
    text-align: center
    border-left 1px solid #ccc
    background #fcfcfc
    

  .arrow-up, .arrow-down
    height 50%
    cursor pointer
    font-size 80%
    color $blue
    &:hover
      color $darkblue

  .arrow-up
    border-bottom 1px solid #ccc
    
  @media $xs
    .input-wrapper
      background white
      width 84px
      overflow inherit
      position absolute
      top 0
      left 0
      height 100%
      
    input[type="number"]
      padding 5px
      font-size 22px
      height 100%
      padding 0 0 0 13px
           
    .arrow-down, .arrow-up
      font-size 55%
      padding 14px 0 0 0
      
    .arrows-wrapper
      background none
      
    
  
</style>


<script>
  export default {
    props: ['crateName', 'crateId', 'cratePrice'],
    methods: {
      changeValue(direction, e)
      {
        function findAncestor (el, className)
        {
          while ((el = el.parentElement) && !el.classList.contains(className));
          return el;
        }
        
        var input = findAncestor(e.target, 'input-wrapper').querySelector('input')
        var value = parseInt(input.value)

        if (direction == 'increment')
        {
          input.value = ++value
        }
        else
        {
          if (value > 0)
          {
            input.value = --value
          }
        }


        // Update cart 
        this.$store.commit('cart/UPDATE_CART_ITEM', {
          name: this.crateName,
          id: this.crateId,
          price: this.cratePrice,
          quantity: parseInt(input.value)
        })
        
      }
    },
    computed: {
      itemCount: {
        get ()
        {
          let val
          if (this.$store.state.cart.items.filter(c=> c.name == this.crateName).length)
          {            
            val = this.$store.state.cart.items.filter(c=> c.name == this.crateName)[0].quantity
          }
          else
          {            
            val = 0
          }
          return val
        }
      }
    }
  }
</script>