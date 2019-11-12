import localStorage from './localStorage';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getMarkets() {
  await sleep(500);
  return [
    {
      project: 'Help prevent young people’s homelessness – one step at a time!',
      outcome: 'Financial housing support',
    },
    {
      project: 'Help prevent young people’s homelessness – one step at a time!',
      outcome: 'Make a house a home',
    },
    {
      project: 'Stop animals from suffering in captivity',
      outcome: 'Buy land and create infrastructure',
    }
  ]
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
  return 'TODO';
}

async function getBalance() {
  await sleep(1000);
  return 8.43;
}

// TODO implement
async function listenOnPriceChanges(mmAddress, onChange) {
  for (let i = 1; i < 5; i++) {
    onChange({
      priceBuyYes: 0.51 + (i / 20),
      priceSellYes: 0.50 + (i / 20),
      priceBuyNo: 0.48 + (i / 20),
      priceSellNo: 0.47 + (i / 20),
      timestamp: Date.now(),
    });
    await sleep(2000);
  }
};

export default {
  getMarkets,

  getWallet,
  getBalance,

  listenOnPriceChanges,
};
