import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../RAMmobile/src/Login/Login'; 
import Audits from '../RAMmobile/src/Audits/Audits'; 
import Reponse from '../RAMmobile/src/Reponse/Reponse'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
       <Stack.Screen name="Audits" component={Audits} options={{ headerShown: false }} />
       <Stack.Screen name="Reponse" component={Reponse} options={{ headerShown: false }} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
