import React, {
  useState,
  useEffect
} from 'react';

import { 
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  BleManager
} from 'react-native-ble-plx';

function capitalize(text = '') {
  const textArray = text.split('');
  textArray[0] = textArray[0].toUpperCase();
  return textArray.join('');
}

async function requestPermission() {
  try {
    const {
      ACCESS_COARSE_LOCATION,
      ACCESS_FINE_LOCATION,
    } = PermissionsAndroid.PERMISSIONS;

    await PermissionsAndroid.requestMultiple(
      [
        ACCESS_COARSE_LOCATION, 
        ACCESS_FINE_LOCATION
      ],
      {
        title: "Location Permission",
        message:
          "To use bluetooth we need these permission",
        buttonNeutral: "Pergunte-me depois",
        buttonNegative: "Cancelar",
        buttonPositive: "OK"
      }
    );
  } catch (err) {
    console.warn(err);
  }
};

async function scanDevice(devices, deviceHandler) {
  const bleManager = new BleManager();
  await requestPermission();

  bleManager.startDeviceScan(null, {allowDuplicates: false}, (error, scannedDevice) => {
    if (error) {
      console.log(error);
      bleManager.stopDeviceScan();
    } else {
      if (!devices.some(device => device.name === scannedDevice.name)) {
        console.log(scannedDevice)
        deviceHandler([ ...devices, scannedDevice ]);
      }
    }
  });

  setTimeout(() => bleManager.stopDeviceScan(), 10000);
}

const LedButton = ({ color = '' }) => (
  <TouchableOpacity
    onPress={() => fetch(`http://192.168.100.21:3001/test?msg=${color.toLowerCase()}`)}
  >
    <View style={{ ...styles.button, ...styles.ledButton, backgroundColor: color === 'amarelo' ? '#e9f44e' : '#0bed00'}}>
      <Text style={styles.refreshButtonText}>{capitalize(color)}</Text>
    </View>
  </TouchableOpacity>
);

const RefreshButton = ({ handler }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={handler}
  >
    <View style={styles.button}>
      <Text style={styles.refreshButtonText}>Refresh</Text>
    </View>
  </TouchableOpacity>
);

const DeviceRow = ({ item }) => (
  <View style={styles.deviceRowContainer}>
    <Text style={styles.deviceRowContainerText}>{item.name}</Text>
  </View>
);

const App = () => {
  const [devices, setDevices] = useState([]);
  const handler = () => scanDevice(devices, setDevices);
  
  useEffect(() => {
    scanDevice(devices, setDevices);
  });

  return (
    <View style={styles.screen}>
      <FlatList
        data={devices}
        renderItem={DeviceRow}
        keyExtractor={({ id }) => `${id}`}
      />
      <View style={styles.ledButtonsRow}>
        <LedButton color='verde'/>
        <LedButton color='amarelo'/>
      </View>
      <RefreshButton
        handler={handler}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  deviceRowContainer: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deviceRowContainerText: {
    fontSize: 20
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#48ddea',
    padding: 5,
    margin: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    fontSize: 25,
  },
  ledButtonsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  ledButton: {
    padding: 20,
  },
});

export default App;