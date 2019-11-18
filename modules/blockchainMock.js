import localStorage from './localStorage';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getMarkets() {
  await sleep(50);
  return [
    {
      project: 'Help prevent young people’s homelessness – one step at a time!',
      outcome: 'Financial housing support',
      address: '0x9038156f749D5cFd5a89E0E5Ac16808583E8594f',
    },
    {
      project: 'Help prevent young people’s homelessness – one step at a time!',
      outcome: 'Make a house a home',
      address: '0x9038156f749D5cFd5a89E0E5Ac16808583E8594f',
    },
    {
      project: 'Stop animals from suffering in captivity',
      outcome: 'Buy land and create infrastructure',
      address: '0x9038156f749D5cFd5a89E0E5Ac16808583E8594f',
    }
  ];
}

// TODO implement using ethers.Wallet.createRandom
// Should be called once (the first time when the app initialised)
function generatePrivateKey() {
  return '0x0123456789012345678901234567890123456789012345678901234567890123';
}

async function getWallet() {
  let privateKey = await localStorage.getPrivateKey();
  if (!privateKey) {
    privateKey = generatePrivateKey();
    await localStorage.savePrivateKey(privateKey);
  }
  // Connect ethers.js and return ethers wallet
  // return 'TODO';
  return {
    address: privateKey,
  };
}

async function getBalance() {
  await sleep(100);
  return 8.43;
}

async function listenOnPriceChanges(mmAddress, onChange) {
  for (let i = 1; i < 7; i++) {
    onChange({
      priceBuyYes: 0.51 + (i / 20) - Math.random() * 0.5,
      priceSellYes: 0.50 + (i / 20),
      priceBuyNo: 0.48 + (i / 20) - Math.random() * 0.3,
      priceSellNo: 0.47 + (i / 20),
      timestamp: Date.now() - 10000 * i,
    });
    await sleep(50);
  }
}

async function getBalances(mmAddress) {
  await sleep(400);
  return {
    Yes: 3,
    No: 1,
  };
}

async function getCurrentPrices(mmAddress) {
  await sleep(500);
  return {
    Yes: {
      Buy: 0.53,
      Sell: 0.51,
    },
    No: {
      Buy: 0.43,
      Sell: 0.42
    }
  };
}

async function trade(address, type) {
  await sleep(5000);
  return 'OK';
}

export default {
  getMarkets,

  getWallet,
  getBalance,

  trade,
  getBalances,
  getCurrentPrices,

  listenOnPriceChanges,
};
