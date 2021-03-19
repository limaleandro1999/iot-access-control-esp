import {PermissionsAndroid} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

export async function requestPermission() {
  try {
    const {
      ACCESS_COARSE_LOCATION,
      ACCESS_FINE_LOCATION,
    } = PermissionsAndroid.PERMISSIONS;

    await PermissionsAndroid.requestMultiple(
      [ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION],
      {
        title: 'Location Permission',
        message: 'To use bluetooth we need these permission',
        buttonNeutral: 'Pergunte-me depois',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      },
    );
  } catch (err) {
    console.warn(err);
  }
}

export async function scanDevice(devices, deviceHandler) {
  const bleManager = new BleManager();
  await requestPermission();

  bleManager.startDeviceScan(
    null,
    {allowDuplicates: false},
    (error, scannedDevice) => {
      if (error) {
        bleManager.stopDeviceScan();
      } else {
        if (!devices.some((device) => device.name === scannedDevice.name)) {
          deviceHandler([...devices, scannedDevice]);
        }
      }
    },
  );

  setTimeout(() => bleManager.stopDeviceScan(), 5000);
}
