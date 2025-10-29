/// <reference types="vite/client" />

// Extend ImportMeta with Vite-specific properties
interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: unknown;
    accept(): void;
    accept(cb: (mod: unknown) => void): void;
    accept(dep: string, cb: (mod: unknown) => void): void;
    accept(deps: readonly string[], cb: (mods: unknown[]) => void): void;
    dispose(cb: (data: unknown) => void): void;
    prune(cb: (data: unknown) => void): void;
    invalidate(message?: string): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
    send(event: string, data?: unknown): void;
  };
}

// Extend pinia to support persist option from pinia-plugin-persistedstate
import "pinia";

declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
          key?: string;
          pick?: string[];
          omit?: string[];
          storage?: Storage;
          paths?: string[];
          beforeRestore?: (ctx: { store: Store }) => void;
          afterRestore?: (ctx: { store: Store }) => void;
          serializer?: {
            serialize: (value: S) => string;
            deserialize: (value: string) => S;
          };
          debug?: boolean;
        };
  }
}
