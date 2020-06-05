import VueRouter, { RouteConfig } from 'vue-router'
import Home from '@/views/Home.vue'
import SquadronLayout from '@/views/SquadronLayout.vue'
import ResetPassword from '@/views/account/ResetPassword.vue'
import ChangePassword from '@/views/account/ChangePassword.vue'
import ForgotPassword from '@/views/account/ForgotPassword.vue'
import SquadronBoard from '@/views/board/SquadronBoard.vue'
import PilotBoard from '@/views/board/PilotBoard.vue'
import EditSquadron from '@/views/squadron/EditSquadron.vue'
import LogIn from '@/views/account/LogIn.vue'
import NotFound from '@/views/NotFound.vue'

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
