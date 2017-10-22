<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-items>
        <v-flex xs5>
          <v-btn flat @click="auth()">Get Token</v-btn>
        </v-flex>
        <v-flex xs7>
          <v-text-field :value="token" @input="changeToken" label="put you token here"></v-text-field>
        </v-flex>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
          <settings :token="token" />
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
import Settings from "./Settings";
import Report from "./Report";
const host = "https://oauth.vk.com/blank.html";
const openUrl = `https://oauth.vk.com/authorize?client_id=5446940&scope=messages,users,wall,groups,photos,offline&redirect_uri=${host}&display=page&response_type=token`;

export default {
  name: "auth",
  components: { Settings, Report },
  data() {
    return {
      token: ""
    };
  },
  mounted() {
    this.$data.token = localStorage.getItem("token");
  },
  methods: {
    changeToken(token) {
      this.$data.token = token;
      localStorage.setItem("token", token);
    },
    auth() {
      const authUrl = openUrl;
      const auth = window.open(authUrl, "Auth", "width=1200, height=200");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
