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

export default function WalletScreen() {
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

        {/* <Image
          source={require('../assets/images/alice-si.jpg')}
          style={styles.welcomeImage}
        /> */}
        <Text style={styles.header}>
          Wallet
        </Text>


      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>

        { (balance !== '' && ethersBalance !== '') ? null : <ActivityIndicator size="large" color="#17a6b0" /> }

        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Card.Title title="Balance" subtitle="" left={(props) => <Avatar.Icon {...props} icon="cash" />} />
            <Card.Content>
              <Title>
                <Text style={{fontSize: 30}}>
                  {Number(balance).toFixed(3)} {'\u00A0'}{/* Is it nbsp for react native */}
                </Text>
                <Text style={{fontSize: 15, padding: 30, color: '#666561'}}>
                  tokens
                </Text>
              </Title>

              <Title style={{marginTop: 10}}>
                <Text style={{fontSize: 20}}>
                  {Number(ethersBalance).toFixed(3)} {'\u00A0'}{/* Is it nbsp for react native */}
                </Text>
                <Text style={{fontSize: 12, padding: 30, color: '#666561'}}>
                  eth
                </Text>
                {/* <Text style={{fontSize: 8, color: '#666561'}}>
                   {'\u00A0'} {'<- to pay transaction fees'}
                </Text> */}
              </Title>
            </Card.Content>
            {
              (ethersBalance == 0 || balance == 0) ?
                <Card.Actions>
                  <Button onPress={() => setDialogStatus({visible: true, sending: false})}>Get more</Button>
                </Card.Actions>
              :
                null
            }
            
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

        <Portal>
          <Dialog
             style={{justifyContent: 'flex-end'}}
             visible={dialogStatus.visible}
             onDismiss={() => console.log('asd')}>

            <Dialog.Title>
              {dialogStatus.sending ?
                null
                :
                'Write a secret code to top up your balance and get started'
              }
              
            </Dialog.Title>
            <Dialog.Content>
              { dialogStatus.sending ?
                <View>
                  <Text style={{textAlign: 'center'}}>Request sending</Text>
                  <ActivityIndicator size="large" style={{marginTop: 15}} color="#17a6b0" />
                </View>
                :
                <View>
                  <TextInput
                    mode='outlined'
                    label='Secret code'
                    value={secretCode}
                    onChangeText={setSecretCode}
                  />
                  <Button mode="contained" style={{marginBottom: '30%', marginTop: 20}} contentStyle={{height: 50}} onPress={getEthersAndTokens}>
                    Confirm
                  </Button>
                </View>
                // <Paragraph>You are going to {action} 1 {tabs[selectedTab]} token</Paragraph> 
              }
            </Dialog.Content>
          </Dialog>
        </Portal>

        {/* <View style={styles.notificationContainer}>
          <Snackbar
            duration={3}
            visible={notificationState.visible}
            onDismiss={hideNotification}
          >
            {'notificationState.msg'}
          </Snackbar>
        </View> */}

      </ScrollView>
    </View>
  );
}

WalletScreen.navigationOptions = {
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
  header: {
    fontSize: 25,
    fontWeight: '300',
    textAlign: 'center',
    // marginTop: 40,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 5,
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
