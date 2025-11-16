import { defineStore } from "pinia";
import { ref } from "vue";
import { DateTime } from "luxon";
import { useRootStore } from "./root";
import type { APIResponse } from "@/stores/types";
import type { PilotData } from "@/types";
import { pilotDataFromJSON, type PilotDataJSONDown } from "@/stores/coding";
import { loadResponseBodyOrThrowError } from "@/stores/utils";

export const usePilotDataStore = defineStore("pilotData", () => {
  const pilotData = ref<PilotData | null>(null);
  const pilotDataLoading = ref(false);
  const pilotDataError = ref<Error | null>(null);

  // Pilot-specific date range (separate from squadron passes date range)
  const now = DateTime.now();
  const initialStartDate = now.minus({ weeks: 4 }).startOf("day");
  const initialEndDate = now.endOf("day");

  const startDate = ref<DateTime>(initialStartDate);
  const endDate = ref<DateTime>(initialEndDate);

  /**
   * Loads pilot data including passes and error statistics for a specific pilot.
   *
   * @param squadron The Squadron username.
   * @param pilot The Pilot name.
   * @param dateRange Optional custom date range. If not provided, uses stored dates.
   */
  async function loadPilotData({
    squadron,
    pilot,
    dateRange,
  }: {
    squadron: string;
    pilot: string;
    dateRange?: { start: DateTime; end: DateTime };
  }): Promise<void> {
    if (pilotDataLoading.value) return;

    const rootStore = useRootStore();

    // Update stored dates if provided and valid
    if (dateRange) {
      if (dateRange.start && dateRange.start.isValid) {
        startDate.value = dateRange.start;
      }
      if (dateRange.end && dateRange.end.isValid) {
        endDate.value = dateRange.end;
      }
    }

    pilotData.value = null;
    pilotDataError.value = null;
    pilotDataLoading.value = true;

    try {
      // Date parameters are always required
      let path = `/squadrons/${squadron}/pilots/${encodeURIComponent(pilot)}.json`;

      // Ensure dates are valid before converting to ISO
      if (startDate.value && startDate.value.isValid && endDate.value && endDate.value.isValid) {
        const startISO = startDate.value.toISO();
        const endISO = endDate.value.toISO();
        path += `?start_date=${startISO}&end_date=${endISO}`;
      } else {
        throw new Error("Invalid date range for loading pilot data");
      }

      const result: APIResponse<PilotDataJSONDown> = await rootStore.requestJSON({ path });
      const responseData = loadResponseBodyOrThrowError(result);
      pilotData.value = pilotDataFromJSON(responseData);
      pilotDataLoading.value = false;
    } catch (error: unknown) {
      if (error instanceof Error) {
        pilotDataError.value = error;
        pilotDataLoading.value = false;
      } else {
        throw error;
      }
    }
  }

  /**
   * Sets the date range to the current month.
   */
  function setCurrentMonth() {
    const now = DateTime.now();
    startDate.value = now.startOf("month");
    endDate.value = now.endOf("day");
  }

  /**
   * Sets the date range to the previous month.
   */
  function setPastMonth() {
    const now = DateTime.now();
    const lastMonth = now.minus({ months: 1 });
    startDate.value = lastMonth.startOf("month");
    endDate.value = lastMonth.endOf("month");
  }

  /**
   * Sets the date range to the current week.
   */
  function setCurrentWeek() {
    const now = DateTime.now();
    startDate.value = now.startOf("week");
    endDate.value = now.endOf("day");
  }

  /**
   * Sets the date range to the previous week.
   */
  function setPastWeek() {
    const now = DateTime.now();
    const lastWeek = now.minus({ weeks: 1 });
    startDate.value = lastWeek.startOf("week");
    endDate.value = lastWeek.endOf("week");
  }

  /**
   * Sets the date range to the last 4 weeks (default).
   */
  function setLast4Weeks() {
    const now = DateTime.now();
    startDate.value = now.minus({ weeks: 4 }).startOf("day");
    endDate.value = now.endOf("day");
  }

  function resetPilotData() {
    pilotData.value = null;
    pilotDataError.value = null;
    pilotDataLoading.value = false;
    const resetNow = DateTime.now();
    startDate.value = resetNow.minus({ weeks: 4 }).startOf("day");
    endDate.value = resetNow.endOf("day");
  }

  return {
    pilotData,
    pilotDataLoading,
    pilotDataError,
    startDate,
    endDate,
    loadPilotData,
    setCurrentMonth,
    setPastMonth,
    setCurrentWeek,
    setPastWeek,
    setLast4Weeks,
    resetPilotData,
  };
});
