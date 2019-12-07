import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Buefy from 'buefy';
import 'buefy/dist/buefy.css'
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload, faSearch, faTrash, faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp, faTerminal, faInfo, faCaretRight, faPencilAlt, faAngleUp, faAngleDown, faTag} from '@fortawesome/free-solid-svg-icons'
import router from './router'

library.add(faDownload, faSearch, faTrash, faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp, faTerminal, faInfo, faCaretRight, faPencilAlt, faAngleUp, faAngleDown, faTag);

Vue.use(VueRouter)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(Buefy, { defaultIconPack: 'fas', defaultIconComponent: 'font-awesome-icon' })

Vue.config.productionTip = false
Vue.prototype.$apiURL = process.env.VUE_APP_API_URL

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('YYYY/MM/DD [at] hh:mm')
  }
})
Vue.filter('formatUptime', function(value) {
  if (value) {
    return moment(value).fromNow(true);
  }
})
Vue.filter('humanizeSize', function(size) {
  if(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')