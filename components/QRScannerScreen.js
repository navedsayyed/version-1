import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

const QRScannerScreen = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true); // Prevent multiple scans
    console.log('Scanned data:', data);

    try {
      // For robustness, we'll assume the QR code contains a JSON object
      const qrData = JSON.parse(data);
      onScan(qrData);
    } catch (error) {
      // If the QR code is just plain text, inform the user
      alert(`Invalid QR Code format. Please scan a valid location QR code.`);
    }

    // Close the scanner after processing
    setTimeout(() => onClose(), 1000);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.scanText}>Point your camera at a location QR code.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%'
  },
  scanBox: { 
    width: 250, 
    height: 250, 
    borderWidth: 2, 
    borderColor: '#007AFF', 
    borderStyle: 'dashed', 
    borderRadius: 12 
  },
  scanText: { 
    color: 'white', 
    marginTop: 24, 
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  }
});

export default QRScannerScreen;