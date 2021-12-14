import MapView, { Marker } from "react-native-maps";
import { StatusBar } from 'expo-status-bar';
import StateContext from './components/StateContext.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Map from './components/map.js';
import Honk from './components/honk.js';

const Stack = createNativeStackNavigator();


export default function App() {
    const screenProps = {}
    return (
      <StateContext.Provider value={screenProps}>
      <NavigationContainer>
        <StatusBar/>
        <Stack.Navigator 
            screenOptions={{
              headerShown: false
            }}
            initialRouteName="Map">
          <Stack.Screen 
              name="Map" 
              initialParams={{ initialId: 42}}
              component={Map}
              /> 
          <Stack.Screen 
            name="Honk" component={Honk} 
          />
          
        </Stack.Navigator>
    </NavigationContainer>
    </StateContext.Provider>
    );
  }
//}

// Handy debugging functions                                                                 

/** Show a popup alert dialog with msg and value before returning value */
function alertVal(msg, val) {
  alert(`${msg}:${JSON.stringify(val)}`);
  return val;
}

/** Write msg and value to console.log before returning value */
function logVal(msg, val) {
  //console.log(`${msg}:${JSON.stringify(val)}`);
  return val;
}