<template>
  <div>
    <!-- Icon and drawer. we only want these on mobile -->
     <v-navigation-drawer fixed right clipped app disable-resize-watcher disable-route-watcher v-model="drawer">
      <!--
      <v-list  v-if='$store.state.user.jwt'>
        <v-list-tile to="/dashboard">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list  v-else>
        <v-list-tile @click.native.stop="toggleDialog('login')">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Login</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click.native.stop="toggleDialog('register')">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Register</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list> -->


      <v-list>
        <!-- About -->
        <v-list-tile to="/about">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>About</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <!-- FAQs -->
        <v-list-tile to="/faq">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>FAQs</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <!-- Contact -->
        <v-list-tile to="/contact">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contact</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    

    <!-- DESKTOP -->
    <v-toolbar dark>     
      <v-toolbar-items>
        <v-btn flat  to='/' id='navlogo'></v-btn>
      </v-toolbar-items>   
      <v-spacer></v-spacer>

      <div class="hidden-xs-only">
        <v-btn flat  to='/about'>About</v-btn>
      </div>

      <div class="hidden-xs-only">
        <v-btn flat  to='/contact'>contact</v-btn>
      </div>

      <div class="hidden-xs-only">
        <v-btn flat  to='/faq'>FAQs</v-btn>
      </div>

      <!--
      <div class="hidden-xs-only">
        <div  v-if="$store.state.user.jwt">
          <v-btn flat to='/dashboard'>My Dashboard</v-btn>          
        </div>
        <div v-else>
          <v-btn flat @click.native.stop="showDialog('login')">Log in</v-btn>
          <v-btn flat @click.native.stop="showDialog('register')">Register</v-btn>
        </div>
      </div>
      -->
      
      <v-btn to='/crates' class='accent ship'>SHIP A CRATE</v-btn>    
  
      <v-toolbar-side-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-toolbar-side-icon>
      
    </v-toolbar>

    
  </div>

</template>
<script>  
  export default {  
    data ()
    {
      return {
        drawer: false,
      }
    },
   
    methods: {
      showDialog (content)
      {
        this.$store.commit('dialogs/TOGGLE_DIALOG', {
          show: true,
          content,
        })     
      },
  
      async logout()
      {
        var req = await axios.get(`/user/logout`)
        if (req.data.result)
        {
          this.$router.push('/')
        }
      }
    }    
  }
</script>

<style lang="stylus">

  #navlogo
    color $blue
    //border 1px dashed $blue
    background url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAA0CAMAAAAntD+UAAAAAXNSR0IB2cksfwAAAFdQTFRFAAAANpa2Npm3OJq5MJW6N5q3OJezOI+vNZi4N5i3Npm4Npm3OJe3OJe6OJq3N5m2OJm5Npq5Npm5M5m5Npi4N5i2OJm5Npu5MI+vOZq2N5u4N5q3Npq3ty/N3wAAAB10Uk5TAIX1/zC/QCCP369fgGDgcKDv8FDQkMB/ED9Pn7BFTLMHAAAA+UlEQVR4nO3YzQ6DIAwAYLU4p1NRnOh+3v85Vx3GZQehhmbZRi/CwS+ApYpR9G0RJ+AxktioPtEpnq7XsU6RzCw2fC7pwgU2sJ9kRZqmDOyBOJvABnYHmx1zvBYnd9YSM1sulT8XLvc4ssXLK6XyxwLUEocpGmy1fsY7s6XpCAVAqhCb7DrxDntehvuWYGeAnoHFnNAMLK5Cy8A6bzra5q0AlBNHY3vb2u5ja1smENg1b6U1bwksDKPptNb8orCQD5dxvN6wpSybjMA2awFT3bZKYFUklVFra0Fw/arRGh991ms07w7F9ic/7QL7NyzTmZfphM70P4EjHv1IDqIEa7ZoAAAAAElFTkSuQmCC') no-repeat center
    background-size 80%
    

      
  nav
    background #2d3e50!important
    
    //background #273337!important
    //background white!important
    //box-shadow none!important
    //background transparent!important
  
    // #ship
    //   background $darksalmon      
    //   font-weight bold
</style>