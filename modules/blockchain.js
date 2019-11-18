import BlockchainMock from './blockchainMock';
import localStorage from './localStorage';

import 'ethers/dist/shims.js';
import { ethers } from 'ethers';

import ORCHESTRATOR_JSON from '../contracts/SignallingOrchestrator.json';
import MM_JSON from '../contracts/MarketMaker.json';
import COLLATERAL_JSON from '../contracts/CollateralToken.json';

const SIGNALLING_ORCHESTRATOR = '0x9699b0b659FBbFf0FC15cE01F98E76dee5880550';

const ONE = ethers.utils.parseEther("1");
const MIN_ONE = ethers.utils.parseEther("-1");

let contracts = null;

function getProvider() {
  // return new ethers.providers.JsonRpcProvider('http://2dac0d50.ngrok.io');
  return new ethers.providers.JsonRpcProvider('http://192.168.0.31:8545');

  // Connect Infura provider later
}

function generatePrivateKey() {
  let randomWallet = ethers.Wallet.createRandom();
  console.log(randomWallet.privateKey);
  return randomWallet.privateKey;
}

async function getWallet() {
  let privateKey = await localStorage.getPrivateKey();
  if (!privateKey) {
    privateKey = generatePrivateKey();
    await localStorage.savePrivateKey(privateKey);
  }
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

async function initContracts() {
  contracts = {};
  let wallet = await getWallet();
  contracts.orchestrator = new ethers.Contract(SIGNALLING_ORCHESTRATOR, ORCHESTRATOR_JSON.abi, wallet);
  
  let collateralAddress = await contracts.orchestrator.collateralToken();
  contracts.collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);
}

async function getContracts() {
  if (!contracts) {
    await initContracts();
  }
  return contracts;
}

async function getBalance() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  let contracts = await getContracts();
  let balance = await contracts.collateral.balanceOf(address);
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

async function listenOnPriceChanges(mmAddress, onPriceChangedCallback) {
    function convertPriceToNumber(price) {
    return Number.parseFloat(ethers.utils.formatEther(price)).toPrecision(3);
  }

  let wallet = await getWallet();
  wallet.provider.resetEventsBlock(0); // <- it allows to get all events
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

// Uncomment for testing
// export default BlockchainMock;

// TODO implement trading

export default {
  getWallet,
  getBalance,
  getMarkets,
  listenOnPriceChanges,
  getCurrentPrices,
  getBalances,
};
