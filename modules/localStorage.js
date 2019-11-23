import { AsyncStorage } from 'react-native';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PRIVATE_KEY_KEY = '@PMMAStorage:PrivateKey';

async function getPrivateKey() {
  // AsyncStorage.removeItem(PRIVATE_KEY_KEY); // <- uncomment to test new wallets

  // comment the code below to test new account
  let privateKey = await AsyncStorage.getItem(PRIVATE_KEY_KEY);
  return privateKey;
}

async function savePrivateKey(privateKey) {
  let alreadySaved = await getPrivateKey();
  if (alreadySaved) {
    throw 'Private key should be saved only one time';
  }
  await AsyncStorage.setItem(PRIVATE_KEY_KEY, privateKey);
}

export default {
  getPrivateKey,
  savePrivateKey,
};
