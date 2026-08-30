import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Button,
  Badge,
} from "reactstrap";

import PanelHeader from "components/PanelHeader/PanelHeader.js";
import { haversineMiles } from "utils/geo";

// GPS readings less accurate than this (meters) are skipped — cell/wifi-based
// location can jump hundreds of meters and would fake extra "distance driven".
const MAX_ACCEPTABLE_ACCURACY_METERS = 50;

// Ignore movement smaller than this between two readings — GPS jitter while
// stationary (parked, stopped at a light) otherwise slowly adds up to fake miles.
const MIN_MOVEMENT_MILES = 0.005; // ~8 meters

function formatElapsed(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function MileageTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");
  const [finishedTrip, setFinishedTrip] = useState(null);

  const watchIdRef = useRef(null);
  const lastPointRef = useRef(null); // { lat, lng }
  const startTimeRef = useRef(null);
  const timerIdRef = useRef(null);

  useEffect(() => {
    // Stop the browser's GPS watch if the user navigates away mid-trip
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, []);

  const handlePosition = (position) => {
    setError(""); // a good reading supersedes any earlier transient GPS error
    const { latitude, longitude, accuracy } = position.coords;
    setLastAccuracy(accuracy);

    if (accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
      return; // reading too imprecise to trust
    }

    const prev = lastPointRef.current;
    if (prev) {
      const delta = haversineMiles(prev.lat, prev.lng, latitude, longitude);
      if (delta >= MIN_MOVEMENT_MILES) {
        setDistanceMiles((d) => d + delta);
        lastPointRef.current = { lat: latitude, lng: longitude };
        setPointCount((c) => c + 1);
      }
      // else: too small to count, keep prev as the reference point
    } else {
      lastPointRef.current = { lat: latitude, lng: longitude };
      setPointCount(1);
    }
  };

  const handlePositionError = (err) => {
    setError(
      err.code === err.PERMISSION_DENIED
        ? "Location permission denied. Allow location access in your browser to track mileage."
        : `Location error: ${err.message || "signal temporarily unavailable, retrying…"}`
    );
  };

  const startTrip = () => {
    if (!("geolocation" in navigator)) {
      setError("This browser does not support GPS location.");
      return;
    }

    setError("");
    setFinishedTrip(null);
    setDistanceMiles(0);
    setPointCount(0);
    setElapsedSeconds(0);
    lastPointRef.current = null;
    startTimeRef.current = Date.now();

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handlePositionError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    timerIdRef.current = setInterval(() => {
      setElapsedSeconds((Date.now() - startTimeRef.current) / 1000);
    }, 1000);

    setIsTracking(true);
  };

  const stopTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsTracking(false);
    setFinishedTrip({
      distanceMiles,
      durationSeconds: elapsedSeconds,
      endedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="content">
      <PanelHeader size="sm" />
      <Row>
        <Col md="8" className="mx-auto">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                Mileage Tracker{" "}
                <Badge color={isTracking ? "success" : "secondary"}>
                  {isTracking ? "Tracking" : "Idle"}
                </Badge>
              </CardTitle>
              <p className="card-category">
                Step 1 (frontend only): logs GPS while this tab is open.
                Nothing is saved yet — this proves location capture works
                before we wire it to the backend.
              </p>
            </CardHeader>
            <CardBody>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <Row>
                <Col md="4">
                  <div className="text-center">
                    <h2>{distanceMiles.toFixed(2)}</h2>
                    <p className="card-category">Miles</p>
                  </div>
                </Col>
                <Col md="4">
                  <div className="text-center">
                    <h2>{formatElapsed(elapsedSeconds)}</h2>
                    <p className="card-category">Elapsed</p>
                  </div>
                </Col>
                <Col md="4">
                  <div className="text-center">
                    <h2>{lastAccuracy != null ? `±${Math.round(lastAccuracy)}m` : "—"}</h2>
                    <p className="card-category">
                      GPS accuracy ({pointCount} points used)
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="text-center" style={{ marginTop: "20px" }}>
                {!isTracking ? (
                  <Button color="success" onClick={startTrip}>
                    Start Trip
                  </Button>
                ) : (
                  <Button color="danger" onClick={stopTrip}>
                    Stop Trip
                  </Button>
                )}
              </div>

              {finishedTrip && (
                <div className="alert alert-info" style={{ marginTop: "20px" }}>
                  Trip ended: {finishedTrip.distanceMiles.toFixed(2)} miles in{" "}
                  {formatElapsed(finishedTrip.durationSeconds)}. (Saving trips
                  to your account is the next step — not built yet.)
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default MileageTracker;
