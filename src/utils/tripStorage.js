import axios from "axios";
import { apiUrl, ROUTES } from "config/api";

function currentUserId() {
  return localStorage.getItem("userId") || "anonymous";
}

/** Fetches all trips for the current user from the backend. */
export async function fetchTrips() {
  const userId = currentUserId();
  const res = await axios.get(apiUrl(ROUTES.MILEAGE_TRIP), { params: { userId } });
  return Array.isArray(res.data) ? res.data : [];
}

/** Saves one trip to the backend. Returns the saved trip (with its tripId). */
export async function saveTrip(trip) {
  const userId = currentUserId();
  const res = await axios.post(apiUrl(ROUTES.MILEAGE_TRIP), { userId, trip });
  return res.data;
}

/** Trips for one calendar day (dateKey format: YYYY-MM-DD), from an already-fetched list. */
export function getTripsForDay(trips, dateKey) {
  return trips.filter((t) => t.dateKey === dateKey);
}

/** Summary stats for a given month (monthKey format: YYYY-MM), from an already-fetched list. */
export function getMonthSummary(trips, monthKey) {
  const monthTrips = trips.filter((t) => t.dateKey.startsWith(monthKey));
  const businessMiles = monthTrips
    .filter((t) => t.type === "business")
    .reduce((sum, t) => sum + t.miles, 0);
  const personalMiles = monthTrips
    .filter((t) => t.type === "personal")
    .reduce((sum, t) => sum + t.miles, 0);
  return { businessMiles, personalMiles, tripCount: monthTrips.length };
}

export function getYearBusinessMiles(trips, year) {
  return trips
    .filter((t) => t.dateKey.startsWith(String(year)) && t.type === "business")
    .reduce((sum, t) => sum + t.miles, 0);
}