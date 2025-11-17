import { isNull, omit, mapValues } from 'lodash-es'
import { DateTime } from 'luxon'
import {
  AttachedFile,
  ErrorStatistic,
  ErrorStatistics,
  Logfile,
  Pass,
  PhaseErrorStatistics,
  PilotData,
  Squadron,
} from '@/types'

/** The shape of the squadron JSON data sent from the backend to the frontend. */
export type SquadronJSONDown = Omit<
  Squadron,
  'ID' | 'createdAt' | 'updatedAt' | 'isEditable' | 'unknownPassCount'
> & {
  id: number
  created_at: string
  updated_at: string
  is_editable: boolean
  unknown_pass_count: number
}

/** The shape of the squadron JSON data sent from the frontend to the backend. */
export type SquadronJSONUp = Omit<
  Squadron,
  'ID' | 'createdAt' | 'updatedAt' | 'image' | 'isEditable'
> & {
  image: File
  password?: string
  password_confirmation?: string
}

/**
 * Converts a received squadron JSON representation to a Squadron interface.
 *
 * @param JSON The Squadron JSON to convert.
 * @return A Squadron interface.
 */

export function squadronFromJSON(JSON: SquadronJSONDown): Squadron {
  return {
    ...omit(JSON, 'id', 'created_at', 'updated_at', 'is_editable', 'unknown_pass_count'),
    ID: JSON.id,
    createdAt: DateTime.fromISO(JSON.created_at, { setZone: true }),
    updatedAt: DateTime.fromISO(JSON.updated_at, { setZone: true }),
    isEditable: JSON.is_editable,
    unknownPassCount: JSON.unknown_pass_count,
  }
}

/**
 * Converts a Squadron interface into JSON for sending to the backend.
 *
 * @param squadron The Squadron to serialize.
 * @return The Squadron JSON.
 */

export function squadronToJSON(squadron: Squadron): Partial<SquadronJSONUp> {
  return {
    ...omit(
      squadron,
      'ID',
      'createdAt',
      'updatedAt',
      'isEditable',
      'image',
      'boarding_rate',
      'unknown_pass_count',
    ),
  }
}

/** The shape of the JSON data for a Pass sent from the backend to the frontend. */
export type PassJSONDown = Omit<Pass, 'ID' | 'time' | 'shipName' | 'aircraftType' | 'score'> & {
  id: number
  time: string
  ship_name: string | null
  aircraft_type: string | null
  score: string | null
  'destroyed?'?: boolean
  squadron?: SquadronJSONDown
}

/**
 * Converts received Pass JSON data into a Pass interface object.
 *
 * @param JSON The JSON data received.
 * @return The Pass object.
 */

export function passFromJSON(JSON: PassJSONDown): Pass {
  return {
    ...omit(JSON, 'id', 'ship_name', 'aircraft_type'),
    ID: JSON.id,
    time: DateTime.fromISO(JSON.time, { setZone: true }),
    shipName: JSON.ship_name,
    aircraftType: JSON.aircraft_type,
    score: isNull(JSON.score) ? null : Number.parseFloat(JSON.score),
  }
}

/** The shape of the JSON data for a Pass sent from the frontend to the backend. */
export type PassJSONUp = Omit<Pass, 'ID' | 'time' | 'shipName' | 'aircraftType' | 'score'> & {
  time: string
  ship_name: string | null
  aircraft_type: string | null
  score: string | null
}

/**
 * Serializes a Pass object for sending to the backend.
 *
 * @param pass The pass to serialize.
 * @return The serialized pass.
 */

export function passToJSON(pass: Omit<Pass, 'ID'>): PassJSONUp {
  const time = pass.time.toISO()
  if (!time) throw new Error('Invalid time for Pass')

  return {
    ...omit(pass, 'ID', 'shipName', 'aircraftType'),
    time,
    ship_name: pass.shipName,
    aircraft_type: pass.aircraftType,
    score: isNull(pass.score) ? null : pass.score?.toFixed(1),
  }
}

/** The shape of JSON data for a Logfile file received from the backend. */
type FileJSON = Omit<AttachedFile, 'byteSize'> & {
  byte_size: number
}

/**
 * Converts a JSON-serialized AttachedFile received from the backend into an AttachedFile object.
 *
 * @param JSON The serialized data.
 * @return The AttachedFile object.
 */

function fileFromJSON(JSON: FileJSON): AttachedFile {
  return {
    ...omit(JSON, 'byteSize'),
    byteSize: JSON.byte_size,
  }
}

/** The shape of JSON data for a Logfile received from the backend. */
export type LogfileJSON = Omit<Logfile, 'ID' | 'files' | 'createdAt'> & {
  id: number
  files: FileJSON[]
  created_at: string
  'destroyed?': boolean
}

/**
 * Converts a JSON-serialized Logfile into a Logfile object.
 *
 * @param JSON The serialized data.
 * @return The Logfile object.
 */

export function logfileFromJSON(JSON: LogfileJSON): Logfile {
  return {
    ...JSON,
    ID: JSON.id,
    files: JSON.files.map((file) => fileFromJSON(file)),
    createdAt: DateTime.fromISO(JSON.created_at, { setZone: true }),
  }
}

/** The shape of JSON data for phase error statistics from the backend. */
type PhaseErrorStatisticsJSONDown = {
  phase_description: string
  errors: ErrorStatistic[]
}

/** The shape of JSON data for error statistics from the backend. */
type ErrorStatisticsJSONDown = {
  overall: ErrorStatistic[]
  by_phase: Record<string, PhaseErrorStatisticsJSONDown>
}

/** The shape of JSON data for a pilot show response from the backend. */
export type PilotDataJSONDown = {
  pilot: {
    name: string
  }
  passes: PassJSONDown[]
  boarding_rate: number
  error_statistics: ErrorStatisticsJSONDown
}

/**
 * Converts JSON-serialized phase error statistics into a PhaseErrorStatistics object.
 *
 * @param JSON The serialized data.
 * @return The PhaseErrorStatistics object.
 */
function phaseErrorStatisticsFromJSON(JSON: PhaseErrorStatisticsJSONDown): PhaseErrorStatistics {
  return {
    phaseDescription: JSON.phase_description,
    errors: JSON.errors,
  }
}

/**
 * Converts JSON-serialized error statistics into an ErrorStatistics object.
 *
 * @param JSON The serialized data.
 * @return The ErrorStatistics object.
 */
function errorStatisticsFromJSON(JSON: ErrorStatisticsJSONDown): ErrorStatistics {
  return {
    overall: JSON.overall,
    byPhase: mapValues(JSON.by_phase, phaseErrorStatisticsFromJSON),
  }
}

/**
 * Converts a JSON-serialized PilotData into a PilotData object.
 *
 * @param JSON The serialized data.
 * @return The PilotData object.
 */
export function pilotDataFromJSON(JSON: PilotDataJSONDown): PilotData {
  return {
    pilot: JSON.pilot,
    passes: JSON.passes.map((pass) => passFromJSON(pass)),
    boardingRate: JSON.boarding_rate,
    errorStatistics: errorStatisticsFromJSON(JSON.error_statistics),
  }
}
