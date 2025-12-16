
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Modal, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadImage } from './firebaseConfig';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef(null);

  useEffect(() => {
    console.log("Mobile App Refreshed - Fast Upload Update");
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
        try {
            // 1. Capture at decent quality
            const photoData = await cameraRef.current.takePictureAsync({
                quality: 0.7, 
                base64: false,
                skipProcessing: true,
                shutterSound: false
            });

            console.log("Captured. Compressing...");

            // 2. Resize and Compress for speed
            // Resize to 1080px width (good enough for text, much smaller file)
            const manipResult = await manipulateAsync(
                photoData.uri,
                [{ resize: { width: 1080 } }],
                { compress: 0.5, format: SaveFormat.JPEG }
            );
            
            // 3. Upload the smaller file
            console.log("Uploading compressed...");
            uploadImage(manipResult.uri).then(() => {
                console.log("Background upload success");
                Alert.alert("Sucesso", "Envio Rápido!");
            }).catch((e) => {
                console.error("Background upload failed", e);
                Alert.alert("Erro", "Falha no envio");
            });

        } catch (e) {
            console.error("Capture error", e);
        }
    }
  };

  const increaseZoom = () => setZoom(z => Math.min(z + 0.1, 1));
  const decreaseZoom = () => setZoom(z => Math.max(z - 0.1, 0));

  return (
    <View style={styles.container}>
        <CameraView 
            style={styles.camera} 
            ref={cameraRef} 
            facing="back"
            zoom={zoom}
            ratio="4:3"
            enableZoomGestures={true}
        />
        <View style={styles.buttonContainer} pointerEvents="box-none">
            
            {/* ZOOM CONTROLS */}
            <View style={styles.controlsRow}>
                <View style={styles.zoomControls}>
                    <TouchableOpacity onPress={decreaseZoom} style={styles.zoomBtn}><Text style={styles.zoomText}>-</Text></TouchableOpacity>
                    <Text style={styles.zoomLabel}>{zoom.toFixed(1)}x</Text>
                    <TouchableOpacity onPress={increaseZoom} style={styles.zoomBtn}><Text style={styles.zoomText}>+</Text></TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInner} />
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white'
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 15
  },
  controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 15,
      marginBottom: 20,
      width: '100%'
  },
  zoomControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 5
  },
  ratioBtn: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20
  },
  ratioText: {
      color: 'white',
      fontWeight: 'bold'
  },
  zoomBtn: {
      padding: 10,
      minWidth: 40,
      alignItems: 'center',
  },
  zoomText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 28
  },
  zoomLabel: {
      color: 'white',
      marginHorizontal: 10,
      fontSize: 16,
      minWidth: 40,
      textAlign: 'center',
      fontVariant: ['tabular-nums']
  },
  captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  captureInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'white',
  }
});
