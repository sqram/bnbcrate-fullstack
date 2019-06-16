<template>

  <v-container class="container about">
          
      <header>
        <h3>Dashboard</h3>
       
      </header> 
      
      <v-layout>
        <v-flex xs12  lg8 offset-lg2>
          <v-card>
            <v-btn flat block large to='/dashboard/account-settings'>Account Settings</v-btn>
          </v-card>

          <v-card>
            <v-btn flat block large to='/dashboard/addresses'>Shipping Addresses</v-btn>
          </v-card>

          <v-card>
            <v-btn flat block large to='/dashboard/credit-cards'>Credit Cards</v-btn>
          </v-card>

          <v-card>
            <v-btn flat block large to='/dashboard/orders'>Order History</v-btn>
          </v-card>

          <v-card>
            <v-btn flat class="" to='#' block large @click.stop.prevent='$store.commit("user/LOGOUT", {redirect: true})'>Logout</v-btn>
          </v-card>          
          
        </v-flex>
      </v-layout>
        

  </v-container>
</template>


<style lang='stylus' scoped >  
  .v-card a    
    color #666
    margin-bottom 1.3em
    padding 2em 
</style>

