import React, { Component, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert,
         Button, 
         LogBox, // Added by lyn to hide warning messages
        } from "react-native";
import Constants from 'expo-constants'; // Added by Lyn
import { StatusBar } from 'expo-status-bar'; // Added by Lyn

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from 'react-native-vector-icons/FontAwesome';
import { initializeApp } from "firebase/app";
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

// Added by lyn to hide warning messages
LogBox.ignoreLogs(['Setting a timer', 
                   'AsyncStorage', // While we're at it, squelch AyncStorage, too!
                   ]); 

let gooseLocations = []

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

async function firebaseGetGoosePins() {
  const q = query(collection(db, 'pins'));
  const querySnapshot = await getDocs(q);
  // const messages = Array.from(querySnapshot).map( docToMessage );
  let pins = []; 
  querySnapshot.forEach(doc => {
      pins.push(docToMessage(doc));
  });
  //console.log(gooseLocations)
  gooseLocations = pins
}


export default function App() {
  // Lyn's simple top level app that puts to togther 
  // a function-based CounterComponent with your GooseComponent
  // as an illustration of mixing the two
  return (
    <View style={styles.screen}>
      <StatusBar style="auto" /> 
      <Counter/> 
      <GooseMap style={{flex: 1}}/>
    </View>
  );
}

function Counter () {
  [count, setCount] = useState(0);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button  
         title={'increment'}
         onPress={() => setCount(count+1)}
       />
    </View>
  );
}

class GooseMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      foregroundPerms: 'unknown',
      rememberedLocations: [],
    };
    this.addMarker = this.addMarker.bind(this);
  }

  _getLocationAsync = async () => {
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
  };

  async addMarker(location1, color1, type1) {
    let date1 = new Date(Date.now()).toString();
    this.setState({
      rememberedLocations: [...this.state.rememberedLocations, {coord: {latitude: location1.coords.latitude, longitude: location1.coords.longitude}, date: date1, color: color1, type:type1}]
    })
    //const timestampString = date1.toString();
    await addDoc(collection(db, "pins"), 
          {
            'timestamp': date1, 
             // 'coord': new GeoPoint(location1.coords.latitude, location1.coords.longitude),
            'color': color1, 
            'type': type1, 
          }
        );
}

createTwoButtonAlert() {
    Alert.alert(
      "Add a Goose",
      "Please select an option for your marker",
      [
        
        { text: "Friendly Goose", onPress: () => this.addMarker(this.state.location, "blue", "Friendly Goose") },
        { text: "Mean Goose", onPress: () => this.addMarker(this.state.location, "red", "Mean Goose") },
        { text: "Gosling", onPress: () => this.addMarker(this.state.location, "pink", "Gosling") },
        { text: "Poopy", onPress: () => this.addMarker(this.state.location, "green", "Poopy") },
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        }
      ]
    );
    }

  async componentDidMount() { // Executes after first render     
    const foregroundResponse = await Location.requestForegroundPermissionsAsync();
    this.setState({ foregroundPerms: foregroundResponse });
    if (foregroundResponse.status === "granted") {
      this._getLocationAsync();
    }
  }


    render() {
      firebaseGetGoosePins()
      
    return (
      <View style={styles.container}>
      <View style={styles.navBar}>
      <Icon 
          name={'user'}
          size={30}
      />
        <Text style={styles.titleText}>Goose</Text>
        <Icon 
          name={'bell'}
          size={30}
      />
      </View>

      {/*(this.state.location!==null) &&
         <MyMapComponent />*/}
      
      {(this.state.location!==null) &&
        <MapView
          initialRegion={
              {latitude: this.state.location.coords.latitude,
               longitude: this.state.location.coords.longitude,
               latitudeDelta: 0.045,
               longitudeDelta: 0.045
              }
          }
          showsCompass={true}
          showsUserLocation={true}
          rotateEnabled={true}
          ref={map => { this.map = map; }}
          style={{ flex: 1 }}
          > 
          {
          gooseLocations.map( sloc =>
            <Marker key={sloc.name}
              coordinate={
                {latitude: sloc.coord.latitude,
                longitude: sloc.coord.longitude}
              }
              pinColor={sloc.color}
              title={sloc.type}
            >
            </Marker>
            )
          }
          
        {
          this.state.rememberedLocations.map( sloc =>
            <Marker key={sloc.date}
              coordinate={
                {latitude: sloc.coord.latitude,
                longitude: sloc.coord.longitude}
              }
              pinColor={sloc.color}
              title={sloc.type}
            >
            </Marker>
            )
          }
        </MapView>
      }
       <TouchableOpacity 
        style={styles.button} 
        onPress={() => this.createTwoButtonAlert()}> 
          <Icon 
          name={'plus'}
          size={30}
          />
      </TouchableOpacity>

      <View style={styles.navBar}>
      <TouchableOpacity >
          <Icon 
          name={'map'}
          size={35}
          />
      </TouchableOpacity>
      <TouchableOpacity >
          <Icon 
          name={'comment'}
          size={35}
          />
      </TouchableOpacity>
      </View>
      </View>
    );
  }
}

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


const styles = StyleSheet.create({
  screen: { // Added by lyn 
    flex: 1,
    width: '100%',
    paddingTop: Constants.statusBarHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
   },
    container: {
      flex: 1,
      width: '100%',// Added by lyn
      backgroundColor: "#B5E2FA",
      marginTop: 40,
      marginBottom:20,
      marginLeft:10,
      marginRight:10,
    },
    text: {
      padding: 10,
    },
    button: {
      borderWidth:1,
      borderColor:'#0FA3B1',
      alignItems: 'center',
      justifyContent: 'center',
      width:80,
      height:80,
      borderRadius:80,
      paddingVertical: 10,
      paddingHorizontal: 10,
      elevation: 3,
      backgroundColor: '#0FA3B1',
      marginTop: -100,
    },
    titleText: {
      fontSize: 20,
      fontWeight: "bold"
    },
    navBar: {
      flexDirection: 'row',
      paddingTop: 30,
      marginBottom: 10,
      height: 64,
      backgroundColor: '#B5E2FA',
      justifyContent: 'space-around'
   },
  });