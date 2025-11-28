import React from 'react';
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Home = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffffff" />
      
      {/* 🔝 TOP SECTION */}
      <View style={styles.topSection}>
        <Text style={styles.smallTitle}>
          Home{'\n'}For Pet <Text style={{ fontSize: screenWidth * 0.07 }}>🐾</Text>
        </Text>
        <Text style={styles.title}>Pawfessional</Text>
        <Text style={styles.subtitle}>
          VETERINARY CLINIC AND GROOMING CENTER
          <Text style={{ fontSize: screenWidth * 0.07, marginLeft: 5 }}>🐾</Text>
        </Text>

        <View style={{ position: 'relative' }}>
          <Image
            source={require('../assets/images/cat_hug.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.pawprint}>🐾</Text>
        </View>
      </View>

      {/* 🔻 BOTTOM SECTION */}
      <View style={styles.bottomSection}>
        <Text style={styles.quote}>
          One <Text style={styles.highlight}>loyal friend</Text> is worth{'\n'}
          ten thousand relatives.
        </Text>

        <Text style={styles.desc}>
          We provide effective and high-quality services!
        </Text>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconWrapper}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f97316',
  },
  topSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.05,
    marginTop: screenHeight * 0.05,
  },
  smallTitle: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
    marginTop: screenHeight * 0.065,
  },
  title: {
    fontSize: screenWidth * 0.085,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: screenHeight * 0.02,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: screenWidth * 0.035,
    color: '#fff',
    textAlign: 'center',
    marginLeft: screenWidth * 0.05,
    marginBottom: screenHeight * 0.015,
  },
  image: {
    width: screenWidth * 0.7,
    height: screenHeight * 0.35,
    marginTop: screenHeight * 0.01,
    marginLeft: screenWidth * 0.1,
  },
  pawprint: {
    position: 'absolute',
    left: screenWidth * 0.13,
    top: screenHeight * 0.24,
    fontSize: screenWidth * 0.07,
  },
  bottomSection: {
    flex: 1.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: screenWidth * 0.22,
    borderTopRightRadius: screenWidth * 0.22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenHeight * 0.04,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  quote: {
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,
    color: '#000',
    paddingBottom: screenHeight * 0.11,
  },
  highlight: {
    color: '#f97316',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: screenWidth * 0.035,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: screenHeight * 0.035,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    paddingVertical: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.07,
    borderRadius: screenWidth * 0.03,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: screenHeight * 0.07,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    width: screenWidth * 0.09,
    height: screenWidth * 0.09,
    borderRadius: screenWidth * 0.045,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: screenWidth * 0.02,
  },
  playIcon: {
    color: '#050505ff',
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    top: -1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: screenWidth * 0.045,
  },
});
