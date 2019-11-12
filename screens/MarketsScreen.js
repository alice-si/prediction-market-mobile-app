import * as WebBrowser from 'expo-web-browser';
import React from 'react';
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
} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

export default function HomeScreen() {
  return (
    <View>
      <View>
        <Text style={styles.header}>
          Markets
        </Text>
      </View>

      <ScrollView style={styles.cardsScrollView}>
        <View style={styles.cardsContainer}>
          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Text {...props} label="P" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Buy land and create infrastructure" subtitle="Project: Stop animals from suffering in captivity" left={(props) => <Avatar.Text {...props} label="B" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="trending-up" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="trending-up" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="trending-up" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="trending-up" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>

          <Card style={styles.marketCard}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="trending-up" />} />
            {/* <Card.Content>
              <Title>Card title</Title>
              <Paragraph>Card content</Paragraph>
            </Card.Content> */}
            {/* <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
            {/* <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> */}
          </Card>
        </View>
      </ScrollView>

    </View>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  header: {
    fontSize: 25,
    fontWeight: '200',
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
