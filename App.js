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
const [email, setEmail] = React.useState(''); // Provide default email for testing
const [password, setPassword] = React.useState(''); // Provide default passwored for testing
const [errorMsg, setErrorMsg] = React.useState('');
const [loggedInUser, setLoggedInUser] = React.useState(null);
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

function emailOf(user) {
  if (user) {
    return user.email;
  } else {
    return null;
  }
}

useEffect( () => {
  if (email !== '' && password !== '') {
    // If defaults are provided for email and password, 
    // use them to log in to avoid the hassle of logging in
    signInUserEmailPassword();
  } 
  checkEmailVerification();

  firebaseGetGoosePins(); // find messages on mount 
  
  // This has worked already, so commenting it out
  // console.log(`on mount: populateFirestoreDB(testMessages)`);
  // populateFirestoreDB(testMessages); 
  return () => {
    // Anything in here is fired on component unmount.
    
  }
}, []);


function signUpUserEmailPassword() {
  console.log('called signUpUserEmailPassword');
  if (auth.currentUser) {
    signOut(auth); // sign out auth's current user (who is not loggedInUser, 
                   // or else we wouldn't be here
  }
  if (!email.includes('@')) {
    setErrorMsg('Not a valid email address');
    return;
  }
  if (password.length < 6) {
    setErrorMsg('Password too short');
    return;
  }
  // Invoke Firebase authentication API for Email/Password sign up 
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(`signUpUserEmailPassword: sign up for email ${email} succeeded (but email still needs verification).`);

      // Clear email/password inputs
      const savedEmail = email; // Save for email verification
      setEmail('');
      setPassword('');

      // Note: could store userCredential here if wanted it later ...
      // console.log(`createUserWithEmailAndPassword: setCredential`);
      // setCredential(userCredential);

      // Send verication email
      console.log('signUpUserEmailPassword: about to send verification email');
      sendEmailVerification(auth.currentUser)
      .then(() => {
          console.log('signUpUserEmailPassword: sent verification email');
          setErrorMsg(`A verification email has been sent to ${savedEmail}. You will not be able to sign in to this account until you click on the verification link in that email.`); 
          // Email verification sent!
          // ...
        });
    })
    .catch((error) => {
      console.log(`signUpUserEmailPassword: sign up failed for email ${email}`);
      const errorMessage = error.message;
      // const errorCode = error.code; // Could use this, too.
      console.log(`createUserWithEmailAndPassword: ${errorMessage}`);
      setErrorMsg(`createUserWithEmailAndPassword: ${errorMessage}`);
    });
}

function signInUserEmailPassword() {
  console.log('called signInUserEmailPassword');
  console.log(`signInUserEmailPassword: emailOf(currentUser)0=${emailOf(auth.currentUser)}`); 
  console.log(`signInUserEmailPassword: emailOf(loggedInUser)0=${emailOf(loggedInUser)}`); 
  // Invoke Firebase authentication API for Email/Password sign in 
  // Use Email/Password for authentication 
  signInWithEmailAndPassword(auth, email, password)
                             /* 
                             defaultEmail ? defaultEmail : email, 
                             defaultPassword ? defaultPassword : password
                             */
    .then((userCredential) => {
      console.log(`signInUserEmailPassword succeeded for email ${email}; have userCredential for emailOf(auth.currentUser)=${emailOf(auth.currentUser)} (but may not be verified)`); 
      console.log(`signInUserEmailPassword: emailOf(currentUser)1=${emailOf(auth.currentUser)}`); 
      console.log(`signInUserEmailPassword: emailOf(loggedInUser)1=${emailOf(loggedInUser)}`); 

      // Only log in auth.currentUser if their email is verified
      checkEmailVerification();

      // Clear email/password inputs 
      setEmail('');
      setPassword('');

      // Note: could store userCredential here if wanted it later ...
      // console.log(`createUserWithEmailAndPassword: setCredential`);
      // setCredential(userCredential);
  
      })
    .catch((error) => {
      console.log(`signUpUserEmailPassword: sign in failed for email ${email}`);
      const errorMessage = error.message;
      // const errorCode = error.code; // Could use this, too.
      console.log(`signInUserEmailPassword: ${errorMessage}`);
      setErrorMsg(`signInUserEmailPassword: ${errorMessage}`);
    });
}

function checkEmailVerification() {
  if (auth.currentUser) {
    console.log(`checkEmailVerification: auth.currentUser.emailVerified=${auth.currentUser.emailVerified}`);
    if (auth.currentUser.emailVerified) {
      console.log(`checkEmailVerification: setLoggedInUser for ${auth.currentUser.email}`);
      setLoggedInUser(auth.currentUser);
      console.log("checkEmailVerification: setErrorMsg('')")
      setErrorMsg('')
    } else {
      console.log('checkEmailVerification: remind user to verify email');
      setErrorMsg(`You cannot sign in as ${auth.currentUser.email} until you verify that this is your email address. You can verify this email address by clicking on the link in a verification email sent by this app to ${auth.currentUser.email}.`)
    }
  }
}

function logOut() {
  console.log('logOut'); 
  console.log(`logOut: emailOf(auth.currentUser)=${emailOf(auth.currentUser)}`);
  console.log(`logOut: emailOf(loggedInUser)=${emailOf(loggedInUser)}`);
  console.log(`logOut: setLoggedInUser(null)`);
  setLoggedInUser(null);
  console.log('logOut: signOut(auth)');
  signOut(auth); // Will eventually set auth.currentUser to null     
}


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
function loginPane() {
  return (
    <View style={loggedInUser === null ? styles.loginLogoutPane : styles.hidden}>
      <View style={styles.labeledInput}>
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput placeholder="Enter an email address" 
          style={styles.textInput} 
          value={email} 
          onChangeText={ textVal => setEmail(textVal)} />
      </View>
      <View style={styles.labeledInput}>
        <Text style={styles.inputLabel}>Password:</Text>
        <TextInput placeholder="Enter a password" 
          style={styles.textInput} 
          value={password} 
          onChangeText={ textVal => setPassword(textVal)} />
      </View>
      <View style={styles.buttonHolder}>
        <TouchableOpacity style={styles.button}
           onPress={() => signUpUserEmailPassword()}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity> 
        <TouchableOpacity style={styles.button}
           onPress={() => signInUserEmailPassword()}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity> 
      </View>
      <View style={errorMsg === '' ? styles.hidden : styles.errorBox}>
        <Text style={styles.errorMessage}>{errorMsg}</Text>
      </View>
    </View>
  );
}

function loggedInUserPane() {
  return (
    <ScrollView style={styles.jsonContainer}>
      <Text style={styles.json}>Logged In User: {formatJSON(loggedInUser)}</Text>
    </ScrollView>
  );
}

function mapPage() {
  return(
  <View style={loggedInUser === null ? styles.hidden : styles.container}>
  
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
  )
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
  }}
 

    
    return (
      <View style={styles.container}>
      <StatusBar style="auto" />
      {loginPane()}
      {mapPage()}
      </View>
      
    );
  


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
    hidden: {
      display: 'none',
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