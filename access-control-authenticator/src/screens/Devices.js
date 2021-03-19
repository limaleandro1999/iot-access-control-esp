import React, {useState, useEffect, useContext} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';

import {AuthContext} from '../../App';

import {scanDevice} from '../services/bluetooth';

function capitalize(text = '') {
  const textArray = text.split('');
  textArray[0] = textArray[0].toUpperCase();
  return textArray.join('');
}

const DeviceModal = function ({modalVisible, setModalVisible, item}) {
  const auth = useContext(AuthContext);
  const authorizeHandler = async () => {
    const {token, expiresAt} = auth.getAuthInfo();

    if (Date.now() >= expiresAt) {
      return auth.signOut();
    }

    try {
      const result = await fetch('http://192.168.100.57:3000/authorize', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

export const Device = () => {
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
