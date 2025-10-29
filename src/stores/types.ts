import { Result } from "ts-results";
import { Logfile, Pass, Squadron } from "@/types";

/**
 * The shape of validation errors received from the backend. A dictionary mapping field names to a
 * list of their errors.
 */
export type Errors = Record<string, string[]>;

export interface RootState {
  squadron: Squadron | null;
  squadronLoading: boolean;
  squadronError: Error | null;
}

export interface AuthState {
  JWT: string | null;
}

export interface MySquadronState {
  mySquadron: Squadron | null;
  mySquadronLoading: boolean;
  mySquadronError: Error | null;
}

export interface LogfilesState {
  logfiles: Logfile[] | null;
  logfilesLoading: boolean;
  logfilesError: Error | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PilotsState {}

export interface PassesState {
  passes: Pass[] | null;
  passesLoading: boolean;
  passesError: Error | null;
  passCurrentPage: number;
  passCount: number;
}

export type AnyModuleState = LogfilesState | PilotsState | PassesState | AuthState;

export interface APISuccess<T> {
  response: Response;
  body?: T;
}

export interface APIFailure {
  response: Response;
  body: { errors: Errors };
}

export type APIResponse<T> = Result<APISuccess<T>, APIFailure>;
