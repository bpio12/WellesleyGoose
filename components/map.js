import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from '../styles/globalStyles.js'
import StateContext from "./StateContext.js";


export default function Map(props) {  
    
    return ( 
        <StateContext.Consumer>
            {screenProps => {const mapProps = screenProps;
            return(
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
      
      {(mapProps.location!==null) &&
        <MapView
          initialRegion={
              {latitude: mapProps.location.coords.latitude,
               longitude: mapProps.location.coords.longitude,
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
          mapProps.gooseLocations.map( sloc =>
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
          mapProps.rememberedLocations.map( sloc =>
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
        onPress={() => mapProps.createTwoButtonAlert()}> 
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
            )}}
      </StateContext.Consumer>
    )
  }