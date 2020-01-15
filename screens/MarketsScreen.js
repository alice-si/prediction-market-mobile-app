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
} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import { NavigationActions } from 'react-navigation';
import Blockchain from '../modules/blockchain';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

function MarketsScreen({navigation}) {
  let [markets, setMarkets] = useState([]);

  useEffect(function() {
    Blockchain.getMarkets().then(markets => {
      setMarkets(markets);
    });
  }, []);

  function onMarketSelected(market) {
    navigation.navigate('Market', {
      address: market.address,
      outcome: market.outcome,
    });
  }

  return (
    <View>
      <View>
        <Text style={styles.header}>
          Markets
        </Text>

        <Text style={{padding: 10, paddingLeft: 30, paddingRight: 30, textAlign: 'center', fontWeight: '300',}}>
          Choose a project to predict if it will succeed or fail
        </Text>
      </View>

      <ScrollView style={styles.cardsScrollView}>
        <View style={styles.cardsContainer}>
          { markets.length == 0 ? <ActivityIndicator size="large" color="#17a6b0" /> : null }
          {
            markets.map((market, index) => 
              <Card onPress={() => onMarketSelected(market)} style={styles.marketCard} key={index}>
                <Card.Title title={market.outcome} subtitle={market.address} left={(props) => <Avatar.Text {...props} label={market.outcome[0]} />} />
                {/* <Card.Content> */}
                  {/* <Title>Card title</Title> */}
                  {/* <Paragraph>{market.address}</Paragraph> */}
                {/* </Card.Content> */}
                {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
                {/* <Card.Actions>
                  <Button>Cancel</Button>
                  <Button mode="outlined">
                    Trade
                    <MaterialIcons name="keyboard-arrow-right" size={15} />
                  </Button>
                </Card.Actions> */}
              </Card>
            )
          }
        </View>
      </ScrollView>

    </View>
  );
}

MarketsScreen.navigationOptions = {
  // title: 'Markets',
  header: null,
};

export default MarketsScreen;

const styles = StyleSheet.create({
  header: {
    fontSize: 25,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 40,
  },

  cardsContainer: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 20,
    marginBottom: 100,
  },

  marketCard: {
    marginBottom: 8,
  },
});
