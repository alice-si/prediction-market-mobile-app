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
import { Avatar, Button, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import Blockchain from '../modules/blockchain';

import { MonoText } from '../components/StyledText';

const NOTIFICATION_TIMEOUT = 1000;

export default function HomeScreen() {
  const [balance, setBalance] = useState('');
  const [wallet, setWallet] = useState({});
  const [notificationState, setNotificationState] = useState({
    visible: false,
    msg: ''
  });

  useEffect(() => {
    Blockchain.getWallet().then(function(wallet) {
      console.log('Got wallet');
      setWallet(wallet);
    });

    Blockchain.getBalance().then(function(balance) {
      console.log('Got balance');
      setBalance(balance);
    });
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

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {/* <DevelopmentModeNotice /> */}

        <Image
          source={require('../assets/images/alice-si.jpg')}
          style={styles.welcomeImage}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>

        { balance !== '' ? null : <ActivityIndicator size="large" color="#17a6b0" /> }

        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Card.Title title="Balance" subtitle="" left={(props) => <Avatar.Icon {...props} icon="cash" />} />
            <Card.Content>
              <Title>
                <Text style={{fontSize: 30}}>
                  {balance} {'\u00A0'}{/* Is it nbsp for react native */}
                </Text>
                <Text style={{fontSize: 15, padding: 30, color: '#666561'}}>
                  DAI
                </Text>
              </Title>
            </Card.Content>
            <Card.Actions>
              <Button >Get more</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Wallet" subtitle={wallet.address} left={(props) => <Avatar.Icon {...props} icon="wallet" />} />
            <Card.Actions>
              <Button onPress={() => copyAddress()}>
                Copy address
                <MaterialIcons name="content-copy" size={15} styles={{marginLeft: 10}} />
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.notificationContainer}>
          <Snackbar
            duration={3}
            visible={notificationState.visible}
            onDismiss={hideNotification}
          >
            {'notificationState.msg'}
          </Snackbar>
        </View>

      </ScrollView>
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
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  welcomeContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginHorizontal: 50,
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
