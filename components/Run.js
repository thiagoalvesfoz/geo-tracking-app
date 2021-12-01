import React from "react";
import _ from "lodash";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import Monitor from "./Monitor";
import haversine from "haversine";

const TASK_FETCH_LOCATION = "TASK_FETCH_LOCATION";
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

export default function App(props) {
  const [state, setState] = React.useState({
    latitude: props.latitude,
    longitude: props.longitude,
    routeCoordinates: [],
    distanceTravelled: 0,
    prevLatLng: {},
    coordinate: new AnimatedRegion({
      latitude: props.latitude,
      longitude: props.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  });

  const markerRef = React.useRef(null);

  React.useEffect(async () => {
    await Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
      accuracy: Location.Accuracy.Highest,
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
      timeInterval: 1000,
      deferredUpdatesInterval: 1000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "Noves Bike",
        notificationBody: "O aplicativo está sendo executado em Background",
      },
    });

    return () => Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
  }, []);

  TaskManager.defineTask(TASK_FETCH_LOCATION, async ({ data: { locations }, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    const position = locations[0];

    const { routeCoordinates, distanceTravelled } = state;
    const { latitude, longitude } = position.coords;

    const newCoordinate = {
      latitude,
      longitude,
    };

    if (Platform.OS === "android") {
      if (markerRef && markerRef?.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else {
      coordinate.timing(newCoordinate).start();
    }

    setState({
      ...state,
      latitude,
      longitude,
      routeCoordinates: routeCoordinates.concat([newCoordinate]),
      distanceTravelled: distanceTravelled + calcDistance(newCoordinate),
      prevLatLng: newCoordinate,
    });
  });

  const getMapRegion = () => ({
    latitude: state.latitude,
    longitude: state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const calcDistance = newLatLng => {
    const { prevLatLng } = state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  return (
    <View style={styles.container}>
      <Monitor distance={state.distanceTravelled} />
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followUserLocation
        loadingEnabled
        region={getMapRegion()}
      >
        <Polyline
          lineDashPattern={[1]}
          lineCap={"square"}
          coordinates={state.routeCoordinates}
          strokeWidth={6}
          strokeColor='#f2b659'
        />

        <Marker.Animated ref={markerRef} coordinate={state.coordinate} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paragraph: {
    color: "white",
  },
  map: {
    flex: 1,
  },
});
