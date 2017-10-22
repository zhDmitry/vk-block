<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" width="600px">
      <v-btn color="primary" dark slot="activator">Open Dialog</v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">Use Google's location service?</span>
        </v-card-title>
        <v-card-text>Lorem ips</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="dialog = false">Disagree</v-btn>
          <v-btn color="green darken-1" flat="flat" @click="dialog = false">Agree</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>


<script>
export default {
  name: "report",
  data() {
    return {
      users: [210700286]
    };
  }
};
</script>

<style>

</style>
