/// <reference types="../vite-env.d.ts" />

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { isNull } from "lodash-es";
import { Result } from "ts-results";
import queryString from "query-string";
import { Consumer, createConsumer } from "@rails/actioncable";
import secrets from "@/config/secrets";
import { ignoreResponseBodyOrReturnError, ignoreResponseBodyOrThrowError } from "@/stores/utils";

interface JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  exp?: string | number;
  nbf?: string | number;
  iat: string | number;
  jti: string;

  u: string;
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const JWT = ref<string | null>(null);

    const JWTPayload = computed((): JWTPayload | null => {
      if (!JWT.value) return null;
      const parts = JWT.value.split(".");
      if (parts.length < 2 || !parts[1]) return null;
      return JSON.parse(atob(parts[1]));
    });

    const loggedIn = computed(() => !isNull(JWT.value));

    const currentUsername = computed((): string | null => {
      const payload = JWTPayload.value;
      if (isNull(payload)) return null;
      return payload.u;
    });

    const actionCableConsumer = computed((): Consumer | null => {
      if (isNull(JWT.value)) return null;
      const URL = `${secrets.actionCableURL}?${queryString.stringify({ jwt: JWT.value })}`;
      return createConsumer(URL);
    });

    const authHeader = computed((): string | null => {
      if (JWT.value) return `Bearer ${JWT.value}`;
      return null;
    });

    function initialize(storedState: { JWT: string | null }) {
      JWT.value = storedState.JWT;
    }

    function resetAuth() {
      JWT.value = null;
    }

    function setJWT(token: string | null) {
      JWT.value = token;
    }

    async function logIn({
      username,
      password,
      rememberMe,
    }: {
      username: string;
      password: string;
      rememberMe: boolean;
    }): Promise<Result<void, string>> {
      const { useRootStore } = await import("./root");
      const rootStore = useRootStore();

      const response = await rootStore.request({
        path: "/login.json",
        method: "post",
        body: { squadron: { username, password, remember_me: rememberMe } },
        skipResetAuth: true,
      });

      const responseResult = await ignoreResponseBodyOrReturnError(response, [422, 401]);
      if (responseResult.ok) {
        const authorization = response.headers.get("Authorization");
        if (authorization && authorization.match(/^Bearer /)) {
          setJWT(authorization.slice(7));
        }
      }
      return responseResult;
    }

    async function logOut(): Promise<void> {
      const { useRootStore } = await import("./root");
      const rootStore = useRootStore();

      const result = await rootStore.requestJSON<void>({ method: "delete", path: "/logout.json" });
      await ignoreResponseBodyOrThrowError(result);
      setJWT(null);
    }

    return {
      JWT,
      JWTPayload,
      loggedIn,
      currentUsername,
      actionCableConsumer,
      authHeader,
      initialize,
      resetAuth,
      setJWT,
      logIn,
      logOut,
    };
  },
  {
    persist: {
      key: "auth",
      storage: localStorage,
      serializer: {
        serialize: (state) => JSON.stringify({ JWT: state.JWT }),
        deserialize: (value) => {
          const parsed = JSON.parse(value);
          return { JWT: parsed.JWT };
        },
      },
    },
  },
);
