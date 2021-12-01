import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import * as Location from "expo-location";
import Run from "./components/Run.background";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      let { status: fore_status } = await Location.requestForegroundPermissionsAsync();
      if (fore_status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // let { status: back_status, ...props } = await Location.requestBackgroundPermissionsAsync();
      // console.log("props", props);

      // if (back_status !== "granted") {
      //   setErrorMsg("Permission to access location was denied");
      //   return;
      // }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='white' />
      </View>
    );
  } else if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Run {...location} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#29252b",
    alignItems: "center",
    justifyContent: "center",
  },
  paragraph: {
    color: "white",
  },
});
