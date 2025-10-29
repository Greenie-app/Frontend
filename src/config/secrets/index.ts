/// <reference types="vite/client" />

import { default as prodSecrets } from "@/config/secrets/secrets.production";
import { default as devSecrets } from "@/config/secrets/secrets.development";
import { default as testSecrets } from "@/config/secrets/secrets.test";
import { Secrets } from "@/config/secrets/type";

let secrets: Secrets;
switch (import.meta.env.MODE) {
  case "production":
    secrets = prodSecrets;
    break;
  case "test":
    secrets = testSecrets;
    break;
  default:
    secrets = devSecrets;
    break;
}
export default secrets;
