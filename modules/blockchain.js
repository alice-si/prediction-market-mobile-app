import localStorage from './localStorage';

import 'ethers/dist/shims.js';
import { ethers } from 'ethers';

import ORCHESTRATOR_JSON from '../contracts/SignallingOrchestrator.json';
import MM_JSON from '../contracts/MarketMaker.json';
import COLLATERAL_JSON from '../contracts/CollateralToken.json';
import CONDITIONAL_TOKENS_JSON from '../contracts/ConditionalTokens.json';

// FIXME: set your local ganache address
const LOCAL_GANACHE_HTTP = 'http://192.168.0.31:8545';
// FIXME: set your deployed signalling orchestrator address
const SIGNALLING_ORCHESTRATOR = '0x9699b0b659FBbFf0FC15cE01F98E76dee5880550';
// FIXME: set your local faucet url
const FAUCET_URL = 'http://192.168.0.31:3000';
// FIXME: set it for rinkeby to the deployment block
const START_BLOCK = 0;

const TX_CHECK_INTERVAL = 300; // ms

const ONE = ethers.utils.parseEther("1");
const MIN_ONE = ethers.utils.parseEther("-1");
const HUNDRED = ethers.utils.parseEther("100");

function getProvider() {
  // return new ethers.providers.JsonRpcProvider('http://2dac0d50.ngrok.io');
  return new ethers.providers.JsonRpcProvider(LOCAL_GANACHE_HTTP);

  // Connect Infura provider later
}

function generatePrivateKey() {
  let randomWallet = ethers.Wallet.createRandom();
  console.log('NEW RANDOM PRIVATE KEY:' + randomWallet.privateKey);
  return randomWallet.privateKey;
}

let privateKeyGenerationInProgress = false;
async function getWallet() {
  let privateKey = await localStorage.getPrivateKey();
  if (!privateKey && !privateKeyGenerationInProgress) {
    privateKeyGenerationInProgress = true;
    privateKey = generatePrivateKey();
    await localStorage.savePrivateKey(privateKey);
  }

  // active waiting till private key is generated
  await new Promise((resolve) => {
    let timer = setInterval(async () => {
      privateKey = await localStorage.getPrivateKey();
      if (privateKey) {
        clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

async function getContracts() {
  let contracts = {};

  let wallet = await getWallet();
  contracts.orchestrator = new ethers.Contract(SIGNALLING_ORCHESTRATOR, ORCHESTRATOR_JSON.abi, wallet);
  
  let collateralAddress = await contracts.orchestrator.collateralToken();
  contracts.collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);

  let conditionalTokensAddress = await contracts.orchestrator.conditionalTokens();
  contracts.conditionalTokens = new ethers.Contract(conditionalTokensAddress, CONDITIONAL_TOKENS_JSON.abi, wallet);

  return contracts;
}

async function getBalance() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  let contracts = await getContracts();
  let balance = await contracts.collateral.balanceOf(address);
  return ethers.utils.formatEther(balance);
}

async function getEthersBalance() {
  let wallet = await getWallet();
  let balance = await wallet.getBalance();
  return ethers.utils.formatEther(balance);
}

async function getMarkets() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  let contracts = await getContracts();
  let marketsCount = await contracts.orchestrator.getMarketsCount();
  let markets = [];
  for (let marketNr = 0; marketNr < marketsCount.toNumber(); marketNr++) {
    let [address, project, outcome] = await contracts.orchestrator.getMarketDetails(marketNr);
    let market = {
      address,
      project,
      outcome,
    };
    markets.push(market);
  }
  return markets;
}

async function listenOnCollateralBalanceChanges(onBalanceChange) {
  let wallet = await getWallet();
  let { collateral } = await getContracts();
  let filter = collateral.filters.Transfer();

  collateral.on(filter, async (from, to) => {
    if (addressesAreEqual(from, wallet.address) || addressesAreEqual(to, wallet.address)) {
      let newBalance = await collateral.balanceOf(wallet.address);
      onBalanceChange(ethers.utils.formatEther(newBalance));
    }
  });
}

async function listenOnEthersBalanceChanges(onBalanceChange) {
  let curBalance = await getEthersBalance();
  let timer = setInterval(async () => {
    let newBalance = await getEthersBalance();
    if (newBalance !== curBalance) {
      onBalanceChange(newBalance);
    }
    curBalance = newBalance;
  }, 5000);
  return timer;
}

async function listenOnPriceChanges(mmAddress, onPriceChangedCallback) {
  function convertPriceToNumber(price) {
    return Number.parseFloat(ethers.utils.formatEther(price)).toPrecision(3);
  }

  let wallet = await getWallet();
  wallet.provider.resetEventsBlock(START_BLOCK); // <- it allows to get all events
  let mm = new ethers.Contract(mmAddress, MM_JSON.abi, wallet.provider);
  let filter = mm.filters.AMMPriceChanged();
  
  mm.on(filter, (priceBuyYes, priceSellYes, priceBuyNo, priceSellNo, timestamp) => {
    onPriceChangedCallback({
      priceBuyYes: +convertPriceToNumber(priceBuyYes),
      priceSellYes: -convertPriceToNumber(priceSellYes),
      priceBuyNo: +convertPriceToNumber(priceBuyNo),
      priceSellNo: -convertPriceToNumber(priceSellNo),
      timestamp: timestamp.toNumber(),
    });
  });
}

async function getCurrentPrices(mmAddress) {
  let contracts = await getContracts();
  let wallet = await getWallet();
  let mm = new ethers.Contract(mmAddress, MM_JSON.abi, wallet);
  return {
    Yes: {
      Buy: Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([ONE, 0]))).toPrecision(3),
      Sell: (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([MIN_ONE, 0])))).toPrecision(3),
    },
    No: {
      Buy: Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, ONE]))).toPrecision(3),
      Sell: (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, MIN_ONE])))).toPrecision(3),
    }
  };
}

async function getBalances(mmAddress) {
  let contracts = await getContracts();
  let wallet = await getWallet();
  let mm = new ethers.Contract(mmAddress, MM_JSON.abi, wallet);
  let yesPosition = await mm.generateAtomicPositionId(0);
  let noPosition = await mm.generateAtomicPositionId(1);
  let result = {};
  result.Yes = ethers.utils.formatEther(await contracts.orchestrator.getOutcomeBalance(wallet.address, yesPosition));
  result.No = ethers.utils.formatEther(await contracts.orchestrator.getOutcomeBalance(wallet.address, noPosition));
  return result;
}

async function trade(mmAddress, type, action) {
  try {
    let wallet = await getWallet();
    let { collateral, conditionalTokens } = await getContracts();
    let mm = new ethers.Contract(mmAddress, MM_JSON.abi, wallet);

    let allowance = await collateral.allowance(wallet.address, mmAddress);

    if (allowance == 0) {
      console.log(`First trading on ${mmAddress}. Joining market...`);
      let setApprovalForAllTx = await conditionalTokens.setApprovalForAll(mmAddress, true, {gasLimit: 1000000});
      console.log({setApprovalForAllTx: setApprovalForAllTx.hash});
      await setApprovalForAllTx.wait();
      let approveTx = await collateral.approve(mmAddress, HUNDRED, {gasLimit: 1000000});
      console.log({approveTx: approveTx.hash});
      await approveTx.wait();
    }
    
    let tokenAmounts = [0, 0];
    let amount = (action == 'buy') ? ONE : MIN_ONE;
    if (type == 'Yes') {
      tokenAmounts[0] = amount;
    }
    if (type == 'No') {
      tokenAmounts[1] = amount;
    }

    let tradeTx = await mm.trade(tokenAmounts, 0, { gasLimit: 1000000 });
    console.log({tradeTx: tradeTx.hash});
    await tradeTx.wait();

    return true;
  } catch (err) {
    // Uncomment for development
    // console.error('Transaction sending error occured');
    // console.error(err);

    return false;
  }
}

// Functions for faucet
async function waitForTx(tx) {
  await new Promise(async (resolve, reject) => {
    if (!tx) {
      reject();
    }

    let timer = setInterval(async () => {

      let status;
      try {
        status = await fetch(`${FAUCET_URL}/api/getTxStatus/${tx}`);
      } catch (err) {
        console.log(err);
        reject();
      }
      
      if (status == 'completed') {
        clearInterval(timer);
        resolve();
      }
      if (status == 'failed') {
        clearInterval(timer);
        reject();
      }
    }, TX_CHECK_INTERVAL);
  });
}

async function getSomeEthers(secretPhrase) {
  let wallet = await getWallet();

  try {
    let response = await fetch(
      `${FAUCET_URL}/api/giveMeEthers/${wallet.address}/${secretPhrase}`);
    // console.log(tx);
    // console.log(tx.json());
    // return tx.json().hash;
    return response.status == 200;
  } catch (err) {
    console.log(err);
    return null;
  }
  
}

async function getSomeTokens(secretPhrase) {
  let wallet = await getWallet();

  try {
    let response = await fetch(
      `${FAUCET_URL}/api/giveMeTokens/${wallet.address}/${secretPhrase}`);
    // console.log(tx);
    // console.log(tx.json());
    // return tx.json().hash;
    return response.status == 200;
  } catch (err) {
    console.log(err);
    return null;
  }
}


function addressesAreEqual(addr1, addr2) {
  return addr1 && addr2 && (addr1.toUpperCase() == addr2.toUpperCase());
}

export default {
  getWallet,
  getBalance,
  getEthersBalance,
  getMarkets,
  listenOnCollateralBalanceChanges,
  listenOnEthersBalanceChanges,
  listenOnPriceChanges,
  getCurrentPrices,
  getBalances,
  trade,

  getSomeEthers,
  getSomeTokens,
  waitForTx,
};
