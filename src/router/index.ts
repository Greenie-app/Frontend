import VueRouter, { RouteConfig } from 'vue-router'

const Home = (/* webpackChunkName: "logged-out" */) => import('@/views/Home.vue')
const ForgotPassword = (/* webpackChunkName: "logged-out" */) => import('@/views/account/ForgotPassword.vue')
const LogIn = (/* webpackChunkName: "logged-out" */) => import('@/views/account/LogIn.vue')
const SquadronBoard = (/* webpackChunkName: "logged-out" */) => import('@/views/board/SquadronBoard.vue')
const PilotBoard = (/* webpackChunkName: "logged-out" */) => import('@/views/board/PilotBoard.vue')
const SquadronLayout = (/* webpackChunkName: "logged-out" */) => import('@/views/SquadronLayout.vue')

const ChangePassword = (/* webpackChunkName: "logged-in" */) => import('@/views/account/ChangePassword.vue')
const EditSquadron = (/* webpackChunkName: "logged-in" */) => import('@/views/squadron/EditSquadron.vue')

const NotFound = () => import('@/views/NotFound.vue')
const ResetPassword = () => import('@/views/account/ResetPassword.vue')

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn
  },
  {
    path: '/squadrons/:squadron',
    component: SquadronLayout,
    children: [
      {
        path: '',
        name: 'SquadronBoard',
        component: SquadronBoard
      },
      {
        path: 'pilots/:pilot',
        name: 'PilotBoard',
        component: PilotBoard
      }
    ]
  },
  {
    path: '/reset_password/:token',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/password/forgot',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/password/change',
    name: 'ChangePassword',
    component: ChangePassword
  },
  {
    path: '/squadron/edit',
    name: 'EditSquadron',
    component: EditSquadron
  },
  { path: '*', component: NotFound }
]

const router = new VueRouter({
  routes

})

export default router
