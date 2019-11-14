import React, { useState, useEffect } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Item,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Appbar,
  DataTable,
  Badge,
  Dialog,
  Portal,
} from 'react-native-paper';

// import { LineChart, BarChart } from 'react-native-chart-kit';
import { LineChart, Grid, AreaChart, YAxis } from 'react-native-svg-charts'

import Blockchain from '../modules/blockchain';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MaterialTabs from 'react-native-material-tabs';
import * as shape from 'd3-shape';

export default function MarketScreen({navigation}) {
  const tabs = ['Yes', 'No'];

  const [chartData, setChartData] = useState({
    labels: [1],
    datasets: [{
      data: [1],
    }],
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [action, setAction] = useState('buy');
  const [actionInProgress, setActioninProgress] = useState(false);
  const [dialogStatus, setDialogStatus] = useState({
    visible: false
  });
  const windowWidth = Dimensions.get("window").width;

  function buyOne() {
    setAction('buy');
    setDialogStatus({visible: true});
  }

  function sellOne() {
    setAction('sell');
    setDialogStatus({visible: true});
  }

  function hideDialog() {
    setDialogStatus({visible: false});
  }

  async function confirmAction() {
    // Add args
    setActioninProgress(true);
    await Blockchain.trade();
    setActioninProgress(false);
    setDialogStatus({visible: false});
    Alert.alert('Transaction sent');
  }

  function calcChartData(prices) {
    let result = {
      labels: [],
      datasets: [{
        data: []
      }],
    };
    for (let price of prices) {
      let date = new Date(price.timestamp);
      result.labels.push(date.getHours() + ":" + date.getMinutes());
      result.datasets[0].data.push(price.priceBuyYes);
    }
    return result;
  }

  useEffect(() => {
    let prices = [];
    Blockchain.listenOnPriceChanges(address, (newPriceChange) => {
      prices.push(newPriceChange);
      const newChartData = calcChartData(prices);
      setChartData(newChartData);
    });
  }, []); // It is important to pass [] as a second argument

  let address = navigation.getParam('address');
  let outcome = navigation.getParam('outcome');

  return (
    <View>
      <View>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content
            title={outcome}
            subtitle={address}
          />
        </Appbar.Header>
      </View>
      <View>
        <SafeAreaView style={styles.container}>
          <MaterialTabs
            items={tabs}
            selectedIndex={selectedTab}
            onChange={setSelectedTab}
            barColor="#17a6b0"
            indicatorColor="#f0d911"
            activeTextColor="white"
          />
        </SafeAreaView>
      </View>
      <ScrollView>
        <View style={styles.chartView}>
          {/* First implemented chart */}
          {/* <LineChart
            data={chartData}
            width={windowWidth - 16} // from react-native
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#17a6b0",
              backgroundGradientTo: "#32a89b",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            onDataPointClick={({value}) => Alert.alert(`${value}`)}
            bezier
            style={{
              marginVertical: 2,
              borderRadius: 0,
            }}
          /> */}

          {/* Second chart try */}
          <YAxis
            data={chartData.datasets[0].data}
            formatLabel={(value) => `${value}`}
            contentInset={{ top: 20, bottom: 20 }}
          />
          <AreaChart
            // style={{ height: 200 }}
            data={chartData.datasets[0].data}
            style={{ flex: 1, marginLeft: 16 }}
            svg={{ stroke: '#17a6b0' }}
            contentInset={{ top: 20, bottom: 20 }}
            curve={shape.curveNatural}
            svg={{ fill: '#17a6b0' }}
          >
            <Grid />
          </AreaChart>
        </View>

        <View>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>
                <Text style={styles.tableHeader}>Token type</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>{tabs[selectedTab]}</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>
                <Text style={styles.tableHeader}>You have</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>3</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>
                <Text style={styles.tableHeader}>Buy price</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>0.53</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>
                <Text style={styles.tableHeader}>Sell price</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>0.51</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        

        <View style={styles.buttonsContainer}>
          <Button style={styles.actionButton} onPress={sellOne} color="#f0d911" contentStyle={styles.buttonContentStyle} mode="contained">
            <Text>Sell</Text>
          </Button>
          <Button style={styles.actionButton} onPress={buyOne} contentStyle={styles.buttonContentStyle} mode="contained">
            <Text>Buy</Text>
          </Button>
        </View>

        <Portal>
          <Dialog
             visible={dialogStatus.visible}
             onDismiss={hideDialog}>
            <Dialog.Title>{action} 1 {tabs[selectedTab]} token</Dialog.Title>
            <Dialog.Content>
              { actionInProgress ?
                <View>
                  <Text style={{textAlign: 'center'}}>Sending transaction</Text>
                  <ActivityIndicator size="large" style={{marginTop: 15}} color="#17a6b0" />
                </View>
                :
                <Paragraph>You are going to {action} 1 {tabs[selectedTab]} token</Paragraph> 
              }
            </Dialog.Content>
            <Dialog.Actions>
              <Button mode="outlined" style={{margin: 5}} onPress={hideDialog}>Cancel</Button>
              <Button mode="contained" style={{margin: 5}} onPress={confirmAction}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
      </ScrollView>
    </View>
  );
}

MarketScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  appbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  header: {
    fontSize: 25,
    fontWeight: '200',
    textAlign: 'center',
    marginTop: 40,
  },
  chartView: {
    height: 200,
    // width: 400,
    // width: '100%',
    // backgroundColor: 'green',
    // flex: 1,
    // justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    color: 'gray',
  },
  priceOnButton: {
    fontSize: 12,
  },
  actionButton: {
    width: '48%',
    margin: '1%',
  },
  buttonContentStyle: {
    height: 50,
  },
  buttonsContainer: {
    flexDirection:'row',
    marginTop: 30,
    marginBottom: 200,
  },
});