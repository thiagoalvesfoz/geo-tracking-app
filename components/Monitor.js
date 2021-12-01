import React from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function App(props) {
  const {
    circuit: { distanceTravelled, speed, averageSpeed, altimetria, control },
    cronometro: { isActive, isPaused, start, pause, resume, stop, cronometro },
  } = props;

  const formatDistance = (distanceTravelled = 0) => {
    if (distanceTravelled < 1000) {
      return `${distanceTravelled.toFixed(0)} m`;
    } else {
      return `${(distanceTravelled / 1000).toFixed(2)} km`;
    }
  };

  const handleControl = () => {
    if (isActive && !isPaused) {
      console.log("pause");
      props.stopCircuit();
      return pause();
    } else if (isActive && isPaused) {
      console.log("resume");
      props.startCircuit();
      return resume();
    } else {
      console.log("play");
      props.startCircuit();
      return start();
    }
  };

  const handleClearDisplay = () => {
    control.clear();
    stop();
  };

  return (
    <>
      <View style={styles.cronometro}>
        <View style={[styles.row, { padding: 16 }]}>
          <View style={[styles.display, { alignItems: "center", marginBottom: 0 }]}>
            <Text style={styles.subtitle}>cronometro</Text>
            <View style={styles.row}>
              <Text style={[styles.label]}>{cronometro}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.row, { paddingHorizontal: 20 }]}>
          <View style={styles.display}>
            <Text style={styles.subtitle}>velocidade</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{speed.toFixed(2)} m/s</Text>
            </View>
          </View>
          <View style={styles.display}>
            <Text style={styles.subtitle}>velocidade média</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{averageSpeed.toFixed(2)} m/s</Text>
            </View>
          </View>
        </View>

        <View style={[styles.row, { padding: 20 }]}>
          <View style={styles.display}>
            <Text style={styles.subtitle}>altimetria</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{altimetria || 0} m</Text>
            </View>
          </View>

          <View style={styles.display}>
            <Text style={styles.subtitle}>distancia percorrida</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{formatDistance(distanceTravelled)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.container]}>
        <View style={[styles.buttonArea, { padding: 20 }]}>
          <TouchableOpacity style={[styles.button, styles.stop, { borderWidth: 0 }]} onPress={handleClearDisplay}>
            <Text style={styles.subtitle}>CLEAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stop]} onPress={pause}>
            <Icon name='stop' color='grey' size={36} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleControl}>
            <Icon name={!isActive || (isActive && isPaused) ? "play" : "pause"} color='white' size={36} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  cronometro: {
    position: "absolute",
    backgroundColor: "white",
    width: width - 60,
    top: 50,
    left: 30,
    borderRadius: 10,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  container: {
    position: "absolute",
    backgroundColor: "white",
    bottom: 30,
    left: 30,
    borderRadius: 10,
    zIndex: 1,
    width: width - 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  buttonArea: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: 80,
    width: 80,
    borderRadius: 50,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
  },
  stop: {
    backgroundColor: "transparent",
    borderWidth: 4,
    marginRight: 20,
    borderColor: "grey",
  },
  display: {
    flex: 1,
    alignItems: "flex-start",
  },
  subtitle: {
    color: "black",
    textTransform: "uppercase",
    fontSize: 12,
  },
});
