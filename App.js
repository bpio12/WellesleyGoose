import React, { Component, useState, useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from 'react-native-vector-icons/FontAwesome';
import { initializeApp } from "firebase/app";
import { StatusBar } from 'expo-status-bar';
import { // access to authentication features:
         getAuth, 
         // for email/password authentication: 
         createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification,
         // for logging out:
         signOut
  } from "firebase/auth";
import { // access to Firestore storage features:
         getFirestore, 
         // for storage access
         collection, doc, addDoc, setDoc,
         query, where, getDocs, GeoPoint
  } from "firebase/firestore";
import StateContext from './components/StateContext.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Map from './components/map.js';
import Honk from './components/honk.js';

const Stack = createNativeStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyCeJf04mc48AC_t2gl5sXegKpRVbsv5Zqk",
  authDomain: "goose-51fe9.firebaseapp.com",
  projectId: "goose-51fe9",
  storageBucket: "goose-51fe9.appspot.com",
  messagingSenderId: "912462102483",
  appId: "1:912462102483:web:62f1cab6e559c0848c3926",
  measurementId: "G-M0NTZG2KJR"
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp); 



function docToMessage(msgDoc) {
  // msgDoc has the form {id: timestampetring, 
  //                   data: {timestamp: ..., 
  //                          author: ..., 
  //                          channel: ..., 
  //                          content: ...}
  // Need to add missing date field to data portion, reconstructed from timestamp
  //console.log('docToMessage');
  const data = msgDoc.data();
  //console.log(msgDoc.id, " => ", data);
  return {...data, date: new Date(data.timestamp)}
}







export default function App() {
  const [location, setLocation] = useState(null)
  const [foregroundPerms, setForegroundPerms] = useState('unknown')
  const [rememberedLocations, setRememberedLocations] = useState([])
  const [gooseLocations, setGooseLocations] = useState([])


  

  async function firebaseGetGoosePins() {
    const q = query(collection(db, 'pins'));
    const querySnapshot = await getDocs(q);
    // const messages = Array.from(querySnapshot).map( docToMessage );
    let pins = []; 
    querySnapshot.forEach(doc => {
        pins.push(docToMessage(doc));
    });
    setGooseLocations(pins)
  }

  async function _getLocationAsync() {
    // watchPositionAsync returns location with lat, long, & more on location change
    this.subscription = await Location.watchPositionAsync(
      // Argument #1: location options
      {
        enableHighAccuracy: true,
        distanceInterval: 1,
        timeInterval: 10000 // check for location change every 10 seconds
      },
      // Argument #2: location callback
      newLocation => {
        this.setState({ location: newLocation});
      }
    );
  }

  async function addMarker(location1, color1, type1) {
    let date1 = new Date(Date.now()).toString();
    setRememberedLocations([...rememberedLocations, {coord: {latitude: location1.coords.latitude, longitude: location1.coords.longitude}, date: date1, color: color1, type:type1}]);
    await addDoc(collection(db, "pins"), 
          {
            'timestamp': date1, 
            'coord': new GeoPoint(location1.coords.latitude, location1.coords.longitude),
            'color': color1, 
            'type': type1, 
          }
        );
}

function createTwoButtonAlert() {
    Alert.alert(
      "Add a Goose",
      "Please select an option for your marker",
      [
        
        { text: "Friendly Goose", onPress: () => addMarker(location, "blue", "Friendly Goose") },
        { text: "Mean Goose", onPress: () => addMarker(location, "red", "Mean Goose") },
        { text: "Gosling", onPress: () => addMarker(location, "pink", "Gosling") },
        { text: "Poopy", onPress: () => addMarker(location, "green", "Poopy") },
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        }
      ]
    );
    };

  async function componentDidMount() { // Executes after first render     
    const foregroundResponse = await Location.requestForegroundPermissionsAsync();
    this.setState({ foregroundPerms: foregroundResponse });
    if (foregroundResponse.status === "granted") {
      this._getLocationAsync();
    }
  }; 

    //render() {
     // firebaseGetGoosePins();

    const screenProps = {gooseLocations, rememberedLocations, location}
      
    return (
      <StateContext.Provider value={screenProps}>
      <NavigationContainer>
        <StatusBar/>
        <Stack.Navigator 
            screenOptions={{ headerStyle: { backgroundColor: 'coral' }}}
            initialRouteName="Map">
          <Stack.Screen 
              name="Map" 
              initialParams={{ initialId: 42}}
              component={Map}
              /> 
         {/*  <Stack.Screen 
            name="Honk" component={Honk} 
          /> */}
          
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


