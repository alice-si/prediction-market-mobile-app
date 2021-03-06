import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Clipboard,
  Alert,

} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Snackbar,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import Blockchain from '../modules/blockchain';

import { MonoText } from '../components/StyledText';

const NOTIFICATION_TIMEOUT = 1000;

export default function HomeScreen({navigation}) {
  const [balance, setBalance] = useState('');
  const [ethersBalance, setEthersBalance] = useState('');
  const [etherBalanceCheckerTimer, setEtherBalanceCheckerTimer] = useState(null);
  const [wallet, setWallet] = useState({});
  const [notificationState, setNotificationState] = useState({
    visible: false,
    msg: ''
  });
  const [secretCode, setSecretCode] = useState('');
  const [dialogStatus, setDialogStatus] = useState({
    visible: false,
    sending: false,
    // visible: true,
  });

  useEffect(() => {
    Blockchain.getWallet().then(function(wallet) {
      setWallet(wallet);
    });

    Blockchain.getBalance().then(function(balance) {
      setBalance(balance);
      if (balance == 0) {
        setDialogStatus({visible: true});
      }
    });

    Blockchain.getEthersBalance().then(function(ethBalance) {
      setEthersBalance(ethBalance);
      if (ethBalance == 0) {
        setDialogStatus({visible: true});
      }
    });

    // TODO disable listening on component unmounting
    // https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1
    Blockchain.listenOnCollateralBalanceChanges(function(newBalance) {
      setBalance(newBalance);
    });

    Blockchain.listenOnEthersBalanceChanges(function(newEthBalance) {
      setEthersBalance(newEthBalance);
    }).then(setEtherBalanceCheckerTimer);

    return function cleanup() {
      if (etherBalanceCheckerTimer) {
        clearTimer(ethersBalanceCheckerTimer);
      }
    }
  }, []); // It is important to pass [], more info here https://css-tricks.com/run-useeffect-only-once/

  function showNotification(msg) {
    setNotificationState({
      visible: true,
      msg
    });
  }

  function hideNotification() {
    setNotificationState({
      visible: false,
    });
  }

  function copyAddress() {
    Clipboard.setString(wallet.address);
    Alert.alert('Wallet address copied to clipboard');
  }

  function checkBalanceButtonClicked() {
    navigation.navigate('Wallet', {});
  }

  function selectProjectButtonClicked() {
    navigation.navigate('Markets', {});
  }

  async function getEthersAndTokens() {
    try {
      setDialogStatus({
        visible: true,
        sending: true,
      });

      let txEthers = await Blockchain.getSomeEthers(secretCode);
      let txTokens = await Blockchain.getSomeTokens(secretCode);

      // TODO: In future we can implement active transactions checking

      if (!txEthers || !txTokens) {
        Alert.alert('Failed :( ');
        return;
      }

      // await Blockchain.waitForTx(txEthers);
      // await Blockchain.waitForTx(txTokens);
      Alert.alert('You got some tokens. Your balance will be updated in about 30 seconds :)');
    } catch (err) {
      console.log(err);
      Alert.alert('Failed :(');
    } finally {
      setDialogStatus({
        visible: false,
        sending: false,
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {/* <DevelopmentModeNotice /> */}

        <Image
          source={require('../assets/images/alice-si.jpg')}
          style={styles.welcomeImage}
        />

        <Text style={{textAlign: 'center', padding: 10, fontWeight: '300'}}>
          Use this app to make predictions on the outcome of charity projects run on alice
        </Text>

        <Button onPress={() => checkBalanceButtonClicked()} mode="contained" style={{marginTop: 10}}>Go to my wallet</Button>

        <Button onPress={() => selectProjectButtonClicked()} mode="outlined" style={{marginTop: 10}}>Select project</Button>

      </View>
    </View>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/development-mode/'
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    // alignItems: 'center',
    // marginTop: 10,
    // marginBottom: 20,
  },
  welcomeImage: {
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  welcomeText: {
    fontSize: 27,
    fontWeight: '200',
    color: 'rgba(96,100,109, 1)',
    lineHeight: 29,
    textAlign: 'center',
  },

  cardsContainer: {
    marginTop: 10,
  },
  card: {
    margin: 10,
  },

  notificationContainer: {
    // position: 'absolute',
    // bottom: 50,
  }

});
