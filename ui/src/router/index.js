import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/manage/Dashboard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/manage',
    redirect: '/manage/dashboard'
  },
  {
    path: '/manage/dashboard',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/manage/server/:sid',
    name: 'serverdash',
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "server" */ '../views/manage/Server.vue')
  },
  {
    path: '/manage/create',
    name: 'create',
    component: () => import(/* webpackChunkName: "create" */'../views/manage/Create.vue')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
