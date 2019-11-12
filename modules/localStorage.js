import { AsyncStorage } from 'react-native';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PRIVATE_KEY_KEY = '@PMMAStorage:PrivateKey';

async function getPrivateKey() {
  let privateKey = await AsyncStorage.getItem(PRIVATE_KEY_KEY);
  return privateKey;
}

async function savePrivateKey(privateKey) {
  let alreadySaved = await getPrivateKey();
  if (alreadySaved) {
    throw 'Private key should be saved only one time';
  }
  await setItem(PRIVATE_KEY_KEY, privateKey);
}

export default {
  getPrivateKey,
  savePrivateKey,
};
