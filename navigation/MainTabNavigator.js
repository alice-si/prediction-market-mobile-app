import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import MarketsScreen from '../screens/MarketsScreen';

import Colors from '../constants/Colors';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
  tintColor: Colors.tintColor,
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-home`
          : 'md-home'
      }
    />
  ),
};

HomeStack.path = '';

const MarketsStack = createStackNavigator(
  {
    Markets: {
      screen: MarketsScreen,
      path: 'Markets',
    },
    Market: {
      screen: MarketScreen,
      path: 'Market',
    },
  },
  config
);

MarketsStack.navigationOptions = {
  tabBarLabel: 'Markets',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-trending-up' : 'md-trending-up'} />
  ),
};

// MarketsStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  MarketsStack,
});

tabNavigator.path = '';

export default tabNavigator;
