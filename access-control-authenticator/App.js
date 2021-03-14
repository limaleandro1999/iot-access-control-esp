import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';

import {BleManager} from 'react-native-ble-plx';

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

async function scanDevice(devices, deviceHandler) {
  const bleManager = new BleManager();
  await requestPermission();

  bleManager.startDeviceScan(
    null,
    {allowDuplicates: false},
    (error, scannedDevice) => {
      if (error) {
        console.log(error);
        bleManager.stopDeviceScan();
      } else {
        if (!devices.some((device) => device.name === scannedDevice.name)) {
          console.log(scannedDevice);
          deviceHandler([...devices, scannedDevice]);
        }
      }
    },
  );

  setTimeout(() => bleManager.stopDeviceScan(), 5000);
}

const DeviceModal = function ({modalVisible, setModalVisible, item}) {
  const authorizeHandler = async () => {
    try {
      const result = await fetch('http://192.168.100.57:3000/authorize', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({uuid: item.serviceUUIDs[0]}),
      });

      if (result.ok) {
        Alert.alert('Accesso Liberado');
        setModalVisible(!modalVisible);
      } else {
        Alert.alert('Accesso Negado');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalLabel}>Device Name</Text>
          <Text style={styles.modalText}>{item?.name}</Text>
          <Text style={styles.modalLabel}>UUID</Text>
          <Text style={styles.modalText}>{item?.serviceUUIDs[0]}</Text>
          <View style={styles.modalActionView}>
            <Pressable
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => authorizeHandler()}>
              <Text style={styles.textStyle}>Requisitar Acesso</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LedButton = ({color = ''}) => (
  <TouchableOpacity
    onPress={() =>
      fetch(`http://192.168.100.57:3000/test?msg=${color.toLowerCase()}`)
    }>
    <View
      style={{
        ...styles.button,
        ...styles.ledButton,
        backgroundColor: color === 'vermelho' ? '#d32828' : '#0bed00',
      }}>
      <Text style={styles.refreshButtonText}>{capitalize(color)}</Text>
    </View>
  </TouchableOpacity>
);

const RefreshButton = ({handler}) => (
  <TouchableOpacity style={styles.button} onPress={handler}>
    <View style={styles.button}>
      <Text style={styles.refreshButtonText}>Refresh</Text>
    </View>
  </TouchableOpacity>
);

const DeviceRow = ({item, setModalVisible, setModalItem}) => (
  <Pressable
    onPress={() => {
      setModalVisible(true);
      setModalItem(item);
    }}>
    <View style={styles.deviceRowContainer}>
      <Text style={styles.deviceRowContainerText}>{item.name}</Text>
    </View>
  </Pressable>
);

const App = () => {
  const [devices, setDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const refreshHandler = () => scanDevice(devices, setDevices);

  useEffect(() => {
    scanDevice(devices, setDevices);
  }, [devices]);

  return (
    <View style={styles.screen}>
      <DeviceModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        item={modalItem}
      />
      <FlatList
        data={devices}
        renderItem={({item}) => (
          <DeviceRow
            setModalVisible={setModalVisible}
            setModalItem={setModalItem}
            item={item}
          />
        )}
        keyExtractor={({id}) => `${id}`}
      />
      <View style={styles.ledButtonsRow}>
        <LedButton color="verde" />
        <LedButton color="vermelho" />
      </View>
      <RefreshButton handler={refreshHandler} />
    </View>
  );
};

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
    fontSize: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 12,
    textAlign: 'left',
    color: '#c3c3c3',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
  },
  modalActionView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default App;
