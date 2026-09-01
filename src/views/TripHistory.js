import React, { useState, useMemo } from "react";
import { Card, CardBody } from "reactstrap";

import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { getTrips, getTripsForDay, getMonthSummary, getYearBusinessMiles } from "utils/tripStorage";

const IRS_RATE_PER_MILE = 0.67;

function dateKeyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function StatTile({ icon, iconBg, label, value, sub }) {
  return (
    <Card>
      <CardBody style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "18px 12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.6px", color: "#9A9A9A", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: "20px", fontWeight: 700 }}>{value}</span>
        {sub && <span style={{ fontSize: "10px", color: "#9A9A9A" }}>{sub}</span>}
      </CardBody>
    </Card>
  );
}

function TripHistory() {
  const days = useMemo(() => lastSevenDays(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(dateKeyOf(new Date()));

  const trips = getTrips();
  const dayTrips = getTripsForDay(selectedDateKey);
  const dayTotal = dayTrips.reduce((sum, t) => sum + t.miles, 0);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSummary = getMonthSummary(monthKey);
  const yearBusinessMiles = getYearBusinessMiles(now.getFullYear());
  const deduction = yearBusinessMiles * IRS_RATE_PER_MILE;

  return (
    <div className="content">
      <PanelHeader size="sm" />

      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          <StatTile
            label="Business Miles"
            value={`${yearBusinessMiles.toFixed(1)} mi`}
            sub="This Year"
            iconBg="rgba(9,106,250,0.14)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#096afa" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19c3-6 6-9 9-9s6 3 6 3" /></svg>}
          />
          <StatTile
            label="Est. Deduction"
            value={`$${deduction.toFixed(2)}`}
            sub={`$${IRS_RATE_PER_MILE.toFixed(2)} / mile`}
            iconBg="rgba(0,217,126,0.14)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D97E" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          />
          <StatTile
            label="This Month"
            value={`${(monthSummary.businessMiles + monthSummary.personalMiles).toFixed(1)} mi`}
            sub={now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            iconBg="rgba(168,85,247,0.14)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>}
          />
          <StatTile
            label="Trips"
            value={trips.length}
            sub="All Time"
            iconBg="rgba(255,165,59,0.14)"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFA53B" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8" /></svg>}
          />
        </div>

        <Card>
          <CardBody style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              {days.map((d) => {
                const key = dateKeyOf(d);
                const isSelected = key === selectedDateKey;
                const total = getTripsForDay(key).reduce((sum, t) => sum + t.miles, 0);
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedDateKey(key)}
                    style={{
                      cursor: "pointer",
                      minWidth: "56px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      padding: "10px 4px",
                      borderRadius: "3px",
                      background: isSelected ? "#096afa" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: isSelected ? "#fff" : "#9A9A9A" }}>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: isSelected ? "#fff" : "#fff" }}>
                      {d.getDate()}
                    </span>
                    <span style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.85)" : "#9A9A9A" }}>
                      {total.toFixed(1)} mi
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 4px 8px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <span style={{ fontSize: "12px", color: "#9A9A9A" }}>{dayTotal.toFixed(1)} mi total</span>
        </div>

        {dayTrips.length === 0 ? (
          <Card>
            <CardBody style={{ textAlign: "center", padding: "24px", color: "#9A9A9A", fontSize: "13px" }}>
              No trips recorded for this day
            </CardBody>
          </Card>
        ) : (
          dayTrips.map((trip) => (
            <Card key={trip.id}>
              <CardBody style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: trip.type === "business" ? "rgba(9,106,250,0.14)" : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {trip.type === "business" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#096afa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></svg>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{trip.purpose || "Trip"}</span>
                    <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                      {trip.time} · {Math.round(trip.durationSeconds / 60)} min
                    </span>
                    {trip.note && <span style={{ fontSize: "11px", color: "#096afa" }}>{trip.note}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{trip.miles.toFixed(2)} mi</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                      color: trip.type === "business" ? "#096afa" : "#9A9A9A",
                    }}
                  >
                    {trip.type}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default TripHistory;
