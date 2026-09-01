/**
 * Interim trip data layer — browser localStorage, scoped per user.
 *
 * Every function here is written the way the future API calls will be:
 * takes/returns plain trip objects, one function per operation. Once the
 * real backend (DynamoDB + Lambda) exists, only the bodies of these
 * functions change to axios calls — nothing that imports this module
 * needs to change.
 */

const STORAGE_KEY_PREFIX = "mesob_trips_";

function storageKey() {
  const userId = localStorage.getItem("userId") || "anonymous";
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getTrips() {
  try {
    const raw = localStorage.getItem(storageKey());
    const trips = raw ? JSON.parse(raw) : [];
    return Array.isArray(trips) ? trips : [];
  } catch {
    return [];
  }
}

export function saveTrip(trip) {
  const trips = getTrips();
  const withId = { id: `trip_${Date.now()}`, ...trip };
  trips.unshift(withId);
  localStorage.setItem(storageKey(), JSON.stringify(trips));
  return withId;
}

export function deleteTrip(tripId) {
  const trips = getTrips().filter((t) => t.id !== tripId);
  localStorage.setItem(storageKey(), JSON.stringify(trips));
}

/** Trips for one calendar day (dateKey format: YYYY-MM-DD). */
export function getTripsForDay(dateKey) {
  return getTrips().filter((t) => t.dateKey === dateKey);
}

/** Summary stats for a given month (monthKey format: YYYY-MM). */
export function getMonthSummary(monthKey) {
  const trips = getTrips().filter((t) => t.dateKey.startsWith(monthKey));
  const businessMiles = trips
    .filter((t) => t.type === "business")
    .reduce((sum, t) => sum + t.miles, 0);
  const personalMiles = trips
    .filter((t) => t.type === "personal")
    .reduce((sum, t) => sum + t.miles, 0);
  return {
    businessMiles,
    personalMiles,
    tripCount: trips.length,
  };
}

export function getYearBusinessMiles(year) {
  return getTrips()
    .filter((t) => t.dateKey.startsWith(String(year)) && t.type === "business")
    .reduce((sum, t) => sum + t.miles, 0);
}
