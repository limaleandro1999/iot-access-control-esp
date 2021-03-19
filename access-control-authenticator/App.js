import React from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Button} from 'react-native-paper';

import {Device} from './src/screens/Devices';
import Login from './src/screens/Login';

export const AuthContext = React.createContext();
const Stack = createStackNavigator();

const App = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            expiresAt: action.expiresAt,
            isLoading: false,
          };

        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            expiresAt: action.expiresAt,
          };

        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      expiresAt: 0,
    },
  );
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      const userToken = await EncryptedStorage.getItem('userToken');
      const expiresAt = parseInt(
        await EncryptedStorage.getItem('expiresAt'),
        10,
      );

      if (Date.now() >= expiresAt) {
        await EncryptedStorage.setItem('userToken', null);
        await EncryptedStorage.setItem('expiresAt', '0');
        return dispatch({type: 'SIGN_OUT'});
      }

      return dispatch({type: 'RESTORE_TOKEN', token: userToken, expiresAt});
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async ({token, expiresIn = 0}) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        await EncryptedStorage.setItem('userToken', token);
        await EncryptedStorage.setItem('expiresAt', expiresAt.toString());
        return dispatch({type: 'SIGN_IN', token, expiresAt});
      },
      signOut: async () => {
        await EncryptedStorage.setItem('userToken', null);
        await EncryptedStorage.setItem('expiresAt', '0');
        return dispatch({type: 'SIGN_OUT'});
      },
      getAuthInfo: () => ({token: state.userToken, expiresAt: state.expiresAt}),
    }),
    [state.expiresAt, state.userToken],
  );

  return (
    <>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator>
            {state.userToken == null ? (
              <Stack.Screen name="Login" component={Login} />
            ) : (
              <Stack.Screen
                name="Devices"
                component={Device}
                options={{
                  headerRight: () => (
                    <Button
                      onPress={() => {
                        authContext.signOut();
                      }}>
                      Sair
                    </Button>
                  ),
                }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </>
  );
};

export default App;
