import { DateTime } from "luxon";

interface Image {
  url: string;
}

export interface Squadron {
  ID: number;
  name: string;
  username: string;
  email: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  image: Image | null;
  isEditable: boolean;
  boardingRate: number | null;
  unknownPassCount: number;
}

export enum Grade {
  Cut = "cut",
  NoGrade = "no_grade",
  Bolter = "bolter",
  Fair = "fair",
  OK = "ok",
  Perfect = "perfect",
  TechniqueWaveoff = "technique_waveoff",
  FoulDeckWaveoff = "foul_deck_waveoff",
  PatternWaveoff = "pattern_waveoff",
  OwnWaveoff = "own_waveoff",
}

export interface Pass {
  ID: number;
  pilot: string | null;
  time: DateTime;
  shipName: string | null;
  aircraftType: string | null;
  grade: Grade | null;
  score: number | null;
  trap: boolean | null;
  wire: number | null;
  notes: string | null;
}

export interface AttachedFile {
  filename: string;
  byteSize: number;
}

export enum LogfileState {
  Pending = "pending",
  InProgress = "in_progress",
  Complete = "complete",
  Failed = "failed",
}

export interface Logfile {
  ID: number;
  files: AttachedFile[];
  state: LogfileState;
  progress: number;
  createdAt: DateTime;
}
