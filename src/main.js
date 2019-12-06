import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Buefy from 'buefy';
import 'buefy/dist/buefy.css'
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp} from '@fortawesome/free-solid-svg-icons'
import router from './router'

library.add(faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp);

Vue.use(VueRouter)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(Buefy, { defaultIconPack: 'fas', defaultIconComponent: 'font-awesome-icon' })

Vue.config.productionTip = false
Vue.prototype.$apiURL = process.env.VUE_APP_API_URL

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})
Vue.filter('formatUptime', function(value) {
  if (value) {
    return moment(value).fromNow(true);
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
