import { createApp } from "vue";

import router from "./router";
import pinia, { useRootStore } from "./stores";
import i18n from "@/i18n";
import Layout from "@/views/Layout.vue";
import { scoreFilter } from "@/config/filters";

const app = createApp(Layout);

// Install plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Make scoreFilter globally available
app.config.globalProperties.$filters = {
  score: scoreFilter,
};

// Initialize root store (for localStorage persistence)
const rootStore = useRootStore();
rootStore.initialize();

// Mount app
app.mount("#app");
