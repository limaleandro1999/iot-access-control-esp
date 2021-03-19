import React, {useState, useContext} from 'react';
import {View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';

import {AuthContext} from '../../App';

const Login = () => {
  const auth = useContext(AuthContext);
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const authHandler = async () => {
    const response = await fetch('http://192.168.100.57:3000/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    });

    if (response.ok) {
      const responseBody = await response.json();
      auth.signIn({
        token: responseBody.token,
        expiresIn: responseBody.expiresIn,
      });
    }
  };

  return (
    <View>
      <TextInput
        label="Nome de usuário"
        placeholder="Nome de usuário"
        onChangeText={setUserName}
      />
      <TextInput
        label="Senha"
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button mode="contained" onPress={authHandler}>
        Entrar
      </Button>
    </View>
  );
};


export default Login;
