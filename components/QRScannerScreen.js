import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

const QRScannerScreen = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);
  
  // Function to toggle torch
  const toggleTorch = async () => {
    setTorchOn(prev => !prev);
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{width: 24}} />
      </View>
      
      <CameraView
        ref={cameraRef}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={styles.camera}
        flashMode={torchOn ? 'torch' : 'off'}
        enableTorch={torchOn}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanBox}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>
        <Text style={styles.scanText}>Point your camera at the QR code to scan it.</Text>
      </View>
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.flashlightButton, torchOn ? styles.flashlightActive : null]} 
          onPress={toggleTorch}
        >
          <MaterialIcons name={torchOn ? "flash-on" : "flash-off"} size={24} color="white" />
          <Text style={styles.bottomButtonText}>{torchOn ? "Flash Off" : "Flash On"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    color: 'white',
    fontSize: 32,
  },
  camera: {
    flex: 1,
  },
  overlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  scanBox: { 
    width: 250, 
    height: 250, 
    borderWidth: 1, 
    borderColor: 'transparent', 
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00BFFF',
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00BFFF',
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00BFFF',
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00BFFF',
    borderBottomRightRadius: 10,
  },
  scanText: { 
    color: 'white', 
    marginTop: 24, 
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  bottomButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  flashlightButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  flashlightActive: {
    backgroundColor: '#555',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#00BFFF',
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