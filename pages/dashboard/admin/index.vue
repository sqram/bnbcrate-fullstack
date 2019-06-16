<template>

  <v-container>
          
      <header>
        <h3>Admin &mdash; Orders</h3>       
      </header> 
      
        <div v-if="isFetching"><loading /></div>  
        
          <v-data-table
            class="elevation-1"
            hide-actions
            return-object
            :headers='headers'
            :items='orders'>

            <template slot="items" slot-scope="props">
              <td>{{ props.item.id }}</td>
              <td>
                <v-select
                  :items='selectItems'
                  v-model='props.item.status'
                  @change='onChange($event, props.item)'
                  >
                </v-select>
              </td>              
              <td>{{ props.item.items }}</td>
              <td>{{ props.item.guestName }}</td>
              <td>{{ props.item.address }}</td>        
            </template>
          </v-data-table>

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
      orders: [],
      selectItems: ['new', 'ready', 'shipped'],
      headers: [
        {
          text:'ID',
          value: 'id',
          align: 'left',
          sortable: false,
        },
        { text: 'Status', value: 'status' },
        { text: 'Items', value: 'items' },
        { text: 'Guest Name', value: 'guestName' },
        { text: 'Address', value: 'address' }
      ]
    }
  },
  async beforeMount ()
  {    
    // TODO deconstruct token
    if (!this.$store.state.user.jwt && this.$store.user.lvl != 1)
    {
      this.$router.push('/')
    }
    
  
    const req = await axios({
      method: 'get',
      url: `${window.api}/admin/orders`,
      headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`}
    })

    if (req.data.result)
    {
      this.orders = req.data.payload.orders
    }
    
    this.isFetching = false
  },

  methods: {
    async onChange (v, obj)
    {
      const req = await axios({
        method: 'post',
        data: {id: obj.id, status: v},
        url: `${window.api}/admin/orders/update-status`,
        headers: {'Authorization': `Bearer ${this.$store.state.user.jwt}`}
      })
    }
  }

  
}
</script>

<td class="text-xs-right">{{ props.item.items }}</td>