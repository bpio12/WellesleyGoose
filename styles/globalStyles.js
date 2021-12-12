import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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