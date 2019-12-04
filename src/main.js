import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Buefy from 'buefy';
import 'buefy/dist/buefy.css'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleRight, faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import router from './router'

library.add(faArrowCircleRight);
library.add(faTimesCircle);

Vue.use(VueRouter)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(Buefy, { defaultIconPack: 'fas' })

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
