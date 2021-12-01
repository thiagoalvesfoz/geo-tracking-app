import React from "react";
import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import _ from "lodash";
import Monitor from "./Monitor";
import haversine from "haversine";
import useTimer from "../hooks/useTimer";
import mapStyle from "../styles/mapStyle.json";
import bike from "../styles/bike.png";
const TASK_FETCH_LOCATION = "TASK_FETCH_LOCATION";
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

const defaultCircuit = {
  circuitOn: false,
  prevLatLng: {},
  coordinates: [],
  distanceTravelled: 0,
  averageSpeed: 0,
  elevation: 0,
  altitude: 0,
  speed: 0,
};

export default function App(props) {
  const cronometro = useTimer();
  const [circuit, setCircuit] = React.useState(defaultCircuit);
  const mapRef = React.useRef(null);
  const [userLocation] = React.useState(
    new AnimatedRegion({
      latitude: props.latitude,
      longitude: props.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
  );

  React.useEffect(async () => {
    await Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
      accuracy: Location.Accuracy.BestForNavigation,
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
      deferredUpdatesInterval: 1000,
      distanceInterval: 1,
      timeInterval: 1000,
      foregroundService: {
        notificationTitle: "Noves Bike",
        notificationBody: "O aplicativo está sendo executado em segundo plano",
      },
    });

    return () => Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
  }, []);

  TaskManager.defineTask(TASK_FETCH_LOCATION, async ({ data: { locations }, error }) => {
    if (error) return;

    const {
      timestamp,
      coords: { latitude, longitude, altitude, speed },
    } = locations[0];
    const { coordinates, distanceTravelled } = circuit;

    console.log(locations[0]);

    const newCoordinate = {
      latitude,
      longitude,
      timestamp,
    };

    onChangeMarker(newCoordinate);

    if (circuit.circuitOn) {
      setCircuit({
        ...circuit,
        coordinates: coordinates.concat([newCoordinate]),
        distanceTravelled: distanceTravelled + calcDistance(newCoordinate, "meter"),
        prevLatLng: newCoordinate,
        averageSpeed: calcAvgSpeed(distanceTravelled),
        altitude,
        speed,
      });
    }
  });

  /**
   * Atualiza o marcador com a localização atual do usuário
   * @param {*} newCoordinate
   */
  const onChangeMarker = newCoordinate => {
    userLocation.timing(newCoordinate).start();
  };

  /**
   * Configura a região inicial no mapa de acordo com localização do usuário
   * @returns
   */
  const getMapRegion = () => ({
    latitude: props.latitude,
    longitude: props.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  /**
   * Calcula a distância entre duas coordenadas utilizando a formula de Haversine
   * unit: km, mile, meter, nmi
   * @param {*} newLatLng
   * @param {*} unit
   * @returns float
   */
  const calcDistance = (newLatLng, unit = "meter") => {
    const { prevLatLng } = circuit;
    return haversine(prevLatLng, newLatLng, { unit }) || 0;
  };

  /**
   * Calcula a velocidade média percorrida
   * @param {*} distanceTravelled
   * @returns float
   */
  const calcAvgSpeed = distanceTravelled => {
    return parseFloat(distanceTravelled / cronometro.timer) || 0;
  };

  /**
   * Sinaliza para gravar dados no circuito
   * @returns
   */
  const startCircuit = () => {
    if (circuit.circuitOn) return;

    setCircuit({
      ...circuit,
      circuitOn: true,
    });
  };

  /**
   * Sinaliza para de impedir de receber novos dados
   * @returns
   */
  const stopCircuit = () => {
    if (circuit.circuitOn) {
      setCircuit({
        ...circuit,
        circuitOn: false,
      });
    }
  };

  /**
   * Reinicia o circuito com dados padrão
   * @returns
   */
  const resetCircuit = () => {
    setCircuit(defaultCircuit);
  };

  const controlCircuit = {
    start: startCircuit,
    stop: stopCircuit,
    clear: resetCircuit,
  };

  return (
    <View style={styles.container}>
      <Monitor
        circuit={{ ...circuit, control: controlCircuit }}
        cronometro={cronometro}
        startCircuit={startCircuit}
        stopCircuit={stopCircuit}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        provider={PROVIDER_GOOGLE}
        loadingEnabled
        initialRegion={getMapRegion()}
      >
        <Polyline
          lineDashPattern={[1]}
          lineCap={"square"}
          coordinates={circuit.coordinates}
          strokeWidth={6}
          strokeColor='#f2b659'
        />

        <Marker.Animated coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <Image source={bike} />
        </Marker.Animated>
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
  myLocationIcon: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    zIndex: 1,
    bottom: "40%",
    right: 30,
  },
});
