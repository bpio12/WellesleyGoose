import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert} from "react-native";
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
         query, where, getDocs
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
const db = getFirestore(firebaseApp); // *** new for Firestore

const gooseLocations = [
{ type: 'Friendly Goose',
coord: {latitude: 42.28929, longitude: -71.30570},
color: 'blue',
name: 'test1'},
{ type: 'Gosling',
coord: {latitude: 42.29476, longitude: -71.30512},
color: 'pink',
name: 'test2' },
{ type: 'Mean Goose',
coord: {latitude: 42.29219, longitude: -71.31515},
color: 'red',
name: 'test3' },
{ type: 'Gosling',
coord: {latitude: 42.288355, longitude: -71.308947},
color: 'pink',
name: 'test4' },
]

export default class App extends Component {
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

  addMarker(location1, color1, type1) {
  let date1 = new Date(Date.now()).toString();
  this.setState({
    rememberedLocations: [...this.state.rememberedLocations, {coord: {latitude: location1.coords.latitude, longitude: location1.coords.longitude}, date: date1, color: color1, type:type1}]
  })
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
  console.log(`${msg}:${JSON.stringify(val)}`);
  return val;
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      width:100,
      height:100,
      borderRadius:100,
      paddingVertical: 12,
      paddingHorizontal: 32,
      elevation: 3,
      backgroundColor: '#0FA3B1',
    },
    titleText: {
      fontSize: 20,
      fontWeight: "bold"
    },
    navBar: {
      flexDirection: 'row',
      paddingTop: 30,
      height: 64,
      backgroundColor: '#B5E2FA',
      justifyContent: 'space-around'
   },
  });