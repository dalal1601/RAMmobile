import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview'; // For embedding iframes

const Dashboard = () => {
  const [idMongo, setIdMongo] = useState(null);

  useEffect(() => {
    const getIdMongo = async () => {
      try {
        const storedIdMongo = await AsyncStorage.getItem('idmongo');
        if (storedIdMongo) {
          setIdMongo(storedIdMongo);
          console.log('idMongo from AsyncStorage:', storedIdMongo);
        } else {
          console.log('idMongo not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving idMongo:', error);
      }
    };

    getIdMongo();
  }, []);

  const chartTheme = 'light'; // Adjust based on your theme logic

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>TABLEAU DE BORD</Text>
        <Text style={styles.headerSubtitle}>
          Explorez les informations grâce à la visualisation des données en temps réel
        </Text>
      </View>
      <View style={styles.gridContainer}>
        {[
          '66bcde68-9a98-44da-89ab-139624e23320',
          '66bcdd2b-9a98-4139-8eb1-139624d0a47f',
          '66bcddde-dda6-4c39-8dbc-7266a96c577c',
          '66bbb857-160a-4214-871f-7bacdf2b64e6',
          '66bbb2bb-ee0b-4dc0-8b14-820a63b4373c',
          '66bbd067-160a-4463-81ca-7bacdfbeef34',
          '66bbd933-de7d-4e76-82a2-f5bc93eaeb3b'
        ].map((chartId, index) => (
          <View key={index} style={styles.chartContainer}>
            <WebView
              source={{ uri: `https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=${chartId}&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true` }}
              style={styles.webview}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartContainer: {
    width: '48%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3, // Shadow for Android
  },
  webview: {
    flex: 1,
  },
});

export default Dashboard;
