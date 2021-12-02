import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from 'react-native-vector-icons/FontAwesome'

const gooseLocations = [
{ name: 'Tupelo Point',
coord: {latitude: 42.28929, longitude: -71.30570},
color: 'yellow' },
{ name: 'Paramecium Pond',
coord: {latitude: 42.29476, longitude: -71.30512},
color: 'cyan' },
{ name: 'Paintshop Pond Waterfall',
coord: {latitude: 42.29219, longitude: -71.31515},
color: 'magenta' },
{ name: 'Middle of Lake Waban',
coord: {latitude: 42.288355, longitude: -71.308947},
color: 'blue' },
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

  addMarker(location1) {
  let date1 = new Date(Date.now()).toString();
  this.setState({
    rememberedLocations: [...this.state.rememberedLocations, {coord: {latitude: location1.coords.latitude, longitude: location1.coords.longitude}, date: date1}]
  })
}

createTwoButtonAlert() {
    Alert.alert(
      "Alert Title",
      "My Alert Msg",
      [
        
        { text: "OK", onPress: () => console.log("OK Pressed") },
        {text:'Goose', onPress:()=> this.addMarker(this.state.location)},
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
              title={sloc.name}
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
              pinColor='red'
              title={sloc.date}
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
      backgroundColor: "#fff",
      margin: 50
    },
    text: {
      padding: 10,
    },
    button: {
      borderWidth:1,
      borderColor:'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      width:100,
      height:100,
      borderRadius:100,
      paddingVertical: 12,
      paddingHorizontal: 32,
      elevation: 3,
      backgroundColor: 'skyblue',
    },
  });