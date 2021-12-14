import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity,Alert} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { initializeApp } from "firebase/app";
import * as ImagePicker from 'expo-image-picker';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import 'firebase/compat/firestore';
import { // access to Firestore storage features:
         getFirestore, 
         // for storage access
         collection, doc, addDoc, setDoc,
         query, where, getDocs, GeoPoint
  } from "firebase/firestore";
import * as firebase from 'firebase'


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
const bucket = firebase.app().storage('gs://goose-51fe9.appspot.com');
let options = {
  title: 'Select Image',
  customButtons: [
    { name: 'customOptionKey', title: 'Choose Photo from Custom Option' },
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

/**
* The first arg is the options object for customization (it can also be null or omitted for default options),
* The second arg is the callback which sends object: response (more info in the API Reference)
*/


export default class App extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      pickedImagePath:'',
    };
  } 
 

  // This function is triggered when the "Select an image" button pressed
   showImagePicker = async () => {
    // Ask the user for the permission to access the media library 
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    // Explore the result
    console.log(result);

    if (!result.cancelled) {
      this.setState({pickedImagePath: result.uri});
      console.log(result.uri);
    }
  }
  uploadImage = async(uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    var ref = firebaseApp.storage().ref().child("my-image");
    return ref.put(blob);
  }
  // This function is triggered when the "Open camera" button pressed
   async openCamera (){
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    console.log(result);

    if (!result.cancelled) {
      
      this.setState({pickedImagePath: result.uri});
      console.log(result.uri);
      this.uploadImage();
    }
  }

  



render (){

  const reference = bucket.ref('goose')
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
    <View style={styles.container}>
    <TouchableOpacity 
        style={styles.button} 
        onPress={() => this.openCamera()}> 
          <Icon 
          name={'camera'}
          size={30}
          />
      </TouchableOpacity>

    </View>
  

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
    width:80,
    height:80,
    borderRadius:80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
    backgroundColor: '#0FA3B1',
    marginLeft: 'auto', 
    marginRight: 0,
    marginTop: 'auto',
    marginBottom: 0,
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