import React, { Component } from "react";
import { View, Text, TouchableOpacity,Alert} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from 'react-native-vector-icons/FontAwesome';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, setDoc, query, where, getDocs, GeoPoint } from "firebase/firestore";
import { styles } from '../styles/globalStyles.js'

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

export default class Map extends Component {
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
            'coord': new GeoPoint(location1.coords.latitude, location1.coords.longitude),
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
      <TouchableOpacity 
        onPress={()=> console.log("hi")}
      >
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