## PMMA - Prediction Market Mobile App 

### How to run and test the app with local ganache
- Run impact-signalling project locally (from impact-signalling folder, manual is located in README.md)
  - install npm dependencies
  - compile contracts
  - run ganache
  - deploy contracts
  - update code (replace contracts addresses)
  - run web-app
- In impact-signalling web-app
  - add user (owner) with 10 tokens
  - create some markets
  - trade a bit (it's optional)
- Run mobile app
  - update SIGNALLING_ORCHESTRATOR address and LOCAL_GANACHE_HTTP
    - to get LOCAL_GANACHE_HTTP use ifconfig
  - yarn
  - yarn start
- Send money to mobile app user
  - get wallet adress from mobile (use COPY ADDRESS button)
  - in impact-signalling web-app add money for this address
  - send normal tx with 1 ether to this address (for being able pay for transactions on mobile)
- Watch prices on mobile and trade
  - Click on the markets icon (on the bottom menu bar)
  - Select a market
  - You can buy sell and watch the prices (chart, prices and balances data is updated automatically)


### Important
- Built contracts JSON are copied from impact-signalling project,
  if they will be updated - you should copy the new versions

- You should send tokens and (!important) ethers for being
  able to send transactions from mobile app

- Don't forget to update SIGNALLING_ORCHESTRATOR and LOCAL_GANACHE_HTTP

- Your computer and mobile device should be in the same network (you can use something like ngrok instead, but it's quite slow)

- Ganache should be started with --host 0.0.0.0 parameter

### For development

#### These icons were used
https://expo.github.io/vector-icons/

#### This md library was used
https://callstack.github.io/react-native-paper