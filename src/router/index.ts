import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

const Home = () => import("@/views/Home.vue");
const ForgotPassword = () => import("@/views/account/ForgotPassword.vue");
const LogIn = () => import("@/views/account/LogIn.vue");
const SquadronBoard = () => import("@/views/board/SquadronBoard.vue");
const PilotBoard = () => import("@/views/board/PilotBoard.vue");
const SquadronLayout = () => import("@/views/SquadronLayout.vue");
const ChangePassword = () => import("@/views/account/ChangePassword.vue");
const EditSquadron = () => import("@/views/squadron/EditSquadron.vue");
const NotFound = () => import("@/views/NotFound.vue");
const ResetPassword = () => import("@/views/account/ResetPassword.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "LogIn",
    component: LogIn,
  },
  {
    path: "/squadrons/:squadron",
    component: SquadronLayout,
    children: [
      {
        path: "",
        name: "SquadronBoard",
        component: SquadronBoard,
      },
      {
        path: "pilots/:pilot",
        name: "PilotBoard",
        component: PilotBoard,
      },
    ],
  },
  {
    path: "/reset_password/:token",
    name: "ResetPassword",
    component: ResetPassword,
  },
  {
    path: "/password/forgot",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/password/change",
    name: "ChangePassword",
    component: ChangePassword,
  },
  {
    path: "/squadron/edit",
    name: "EditSquadron",
    component: EditSquadron,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
