import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Buefy from 'buefy';
import 'buefy/dist/buefy.css'
import {formatDistanceToNow, format } from 'date-fns'
//import * as moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload, faSync, faExclamationCircle, faEye, faSearch, faTrash, faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp, faTerminal, faInfo, faCaretRight, faPencilAlt, faAngleUp, faAngleDown, faTag} from '@fortawesome/free-solid-svg-icons'
import router from './router'

library.add(faDownload, faSync, faExclamationCircle, faEye, faSearch, faTrash, faArrowCircleRight, faTimesCircle, faLongArrowAltLeft, faCogs, faList, faFileArchive, faSave, faArrowUp, faTerminal, faInfo, faCaretRight, faPencilAlt, faAngleUp, faAngleDown, faTag);

Vue.use(VueRouter)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(Buefy, { defaultIconPack: 'fas', defaultIconComponent: 'font-awesome-icon' })

Vue.config.productionTip = false
Vue.prototype.$apiURL = process.env.VUE_APP_API_URL;
Vue.prototype.$socketURL = process.env.VUE_APP_SOCKET_URL;

Vue.filter('formatDate', function(value) {
  if (value) {
    return format(new Date(value),'YYYY/MM/DD [at] hh:mm')
    //return moment(String(value)).format()
  }
})
Vue.filter('formatDateSimple', function(value) {
  if (value) {
    return format(new Date(value),'YYYY/MM/DD')
    //return moment(String(value)).format('YYYY/MM/DD')
  }
})
Vue.filter('formatUptime', function(value) {
  if (value) {
    return formatDistanceToNow(new Date(value));
    //return moment(value).fromNow(true);
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