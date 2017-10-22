<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-layout row wrap>
        <v-flex xs12>
          <v-btn block @click="ban()" color="primary">Начать</v-btn>
        </v-flex>
        <v-flex xs12>
          <v-layout row wrap>
            <v-flex xs6>
              <p>Банить за</p>
              <v-radio-group v-model="reason" :mandatory="false">
                <v-radio label="Спам" value="0"></v-radio>
                <v-radio label="детская порнография" value="1"></v-radio>
                <v-radio label="экстремизм" value="2"></v-radio>
                <v-radio label="насилие" value="3"></v-radio>
                <v-radio label="пропаганда наркотиков" value="4"></v-radio>
                <v-radio label="материал для взрослых" value="5"></v-radio>
                <v-radio label="оскорбление" value="6"></v-radio>
                <v-radio label="призывы к суициду" value="8"></v-radio>
              </v-radio-group>
            </v-flex>
            <v-flex xs6>
              <v-slider v-model="banFirst" :label="`Банить первые ${banFirst} постов`"></v-slider>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex xs12>
          <v-layout row wrap>
            <v-flex xs6>
              <v-slider v-model="delay" :max="10" :label="`Банить юзера раз в ${delay} секунд`"></v-slider>
            </v-flex>
            <!-- <v-flex xs6>
              <v-slider v-model="delayAfterUserEnd" :max="20" :label="`Получить список через ${delayAfterUserEnd} секунд`"></v-slider>
            </v-flex> -->
          </v-layout>
        </v-flex>
        <v-flex xs12>
          <v-text-field v-model="groupName" box label="Название группы"></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field v-model="skipList" box multi-line label="Каких людей надо пропустить(12,123,123,) список айдишников"></v-text-field>
        </v-flex>
      </v-layout>
    </v-card>
    <v-dialog v-model="dialog" width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Заблокированные пользователи</span>
        </v-card-title>
        <v-card-text>
          <v-flex xs12 style="display:flex;justify-content:center" v-if="progress!== 100">
            <v-progress-circular v-bind:size="100" v-bind:width="15" v-bind:rotate="-90" v-bind:value="progress" color="primary">
              {{ progress }}
            </v-progress-circular>
          </v-flex>
          <div v-for="item in ids" :key="item.from_id">

            <a target="_blank"  :href="'https:/vk.com/id'+item.from_id"> id{{item.from_id}} </a>
          </div>
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="dialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { run } from "../api";
import _ from "lodash";
export default {
  data() {
    return {
      ids: [],
      progress: 0,
      dialog: false,
      reason: "0",
      groupName: "",
      skipList: "",
      banFirst: 30,
      delayAfterUserEnd: 1,
      delay: 1
    };
  },
  props: ["token"],
  name: "settings",
  mounted() {
    const items = localStorage.getItem("formData");
    if (items && items !== "undefined") {
      const data = JSON.parse(items);
      data.ids = [];
      data.dialog = false;
      data.progress = 0;
      Object.keys(data).forEach(el => {
        this.$data[el] = data[el];
      });
    }
    setInterval(() => {
      localStorage.setItem("formData", JSON.stringify(this.$data));
    }, 3000);
  },
  methods: {
    ban() {
      this.$data.ids = [];
      this.$data.progress = 0;

      const {
        reason,
        groupsList,
        skipList,
        banFirst,
        groupName,
        delayAfterUserEnd,
        delay
      } = this.$data;
      const skip = skipList.split(/[, ]+/).map(el => Number(el));
      this.$data.dialog = true;
      const mapIds = {};
      run({
        reason,
        skipList,
        updateState: el => {
          console.log(el.from_id, mapIds);
          if (!mapIds[el.from_id]) {
            this.$data.ids.push(el);
          }
          mapIds[el.from_id] = true;
        },
        shouldBan: ({ from_id }) => {
          this.$data.progress += Math.ceil(100 / Number(banFirst));
          return skip.indexOf(from_id) === -1 && from_id > 0;
        },
        token: this.token,
        banFirst,
        delayAfterUserEnd,
        delay,
        groupName: groupName
      })
        .start()
        .then(el => {
          this.$data.progress = 100;
          console.log(el);
        });
    }
  }
};
</script>

<style>

</style>
