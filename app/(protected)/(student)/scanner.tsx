import { CameraView, useCameraPermissions, type CameraViewProps } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar as RNStatusBar,
} from 'react-native';
import { usePostEnrollSubjectMutation } from '@/store/api/apiSlice/getApi/student/subjectsEnrolledApiSlice';
import { EnrollementHash } from '@/store/types/students';

type BarcodeType = NonNullable<CameraViewProps['barcodeScannerSettings']>['barcodeTypes'][number];

export default function App() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);

  const scanAreaRef = useRef(null);
  const lastBarcodeData = useRef<string | null>(null);
  const steadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [enroll] = usePostEnrollSubjectMutation();

  useEffect(() => {
    return () => {
      if (steadyTimerRef.current) {
        clearTimeout(steadyTimerRef.current);
      }
    };
  }, []);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const resetScan = () => {
    setScanned(false);
    setScanning(true);
    lastBarcodeData.current = null;
    if (steadyTimerRef.current) {
      clearTimeout(steadyTimerRef.current);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string; type: string }) => {
    if (lastBarcodeData.current === data || !scanning) return;

    if (steadyTimerRef.current) {
      clearTimeout(steadyTimerRef.current);
    }

    const hashKey = data as unknown as EnrollementHash;

    if (!hashKey || typeof hashKey !== 'string') {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid enrollment hash.');
      return;
    }

    steadyTimerRef.current = setTimeout(() => {
      lastBarcodeData.current = data;
      setScanned(true);
      setScanning(false);
      handleRecordAttendance(hashKey);
    }, 0);
  };

  const handleRecordAttendance = async (hashKey: string) => {
    try {
      const response = await enroll({ hashKey }).unwrap();
      console.log('Success response:', response);
      Alert.alert('Success', 'Enrollment successful!');
    } catch (err: any) {
      console.log('Error response:', err);
      Alert.alert('Error', err?.data?.message || 'Failed to enroll in subject.');
    }
  };

  const barcodeTypes: BarcodeType[] = ['qr'];

  if (permission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera permission to scan barcodes and QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullscreen}>
      <RNStatusBar barStyle="light-content" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Scan to Enroll a Subject</Text>
      </View>

      {/* Scan Area */}
      <View style={styles.scanContainer}>
        <View
          ref={scanAreaRef}
          style={[styles.scanBox, scanned ? styles.scanBoxScanned : styles.scanBoxDefault]}
        >
          {scanned && (
            <View style={styles.scanSuccessOverlay}>
              <View style={styles.checkWrapper}>
                <View style={styles.checkInner}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {!scanned && scanning && (
          <Text style={styles.instructionText}>Position barcode within frame</Text>
        )}

        {scanned && (
          <TouchableOpacity style={styles.rescanButton} onPress={resetScan}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.switchCameraButton} onPress={toggleCameraFacing}>
          <Text style={styles.switchCameraText}>⟲</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shutterButton}
          onPress={() => {
            if (scanned) resetScan();
          }}
        >
          <View style={[styles.shutterInner, scanning ? styles.shutterActive : styles.shutterInactive]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
  },
  permissionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scanContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanBoxDefault: {
    borderColor: '#ffffff',
  },
  scanBoxScanned: {
    borderColor: '#22c55e',
  },
  scanSuccessOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34,197,94,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkWrapper: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 999,
  },
  checkInner: {
    backgroundColor: '#22c55e',
    padding: 8,
    borderRadius: 999,
  },
  checkText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  instructionText: {
    color: 'white',
    marginTop: 24,
    fontSize: 18,
  },
  rescanButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 32,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  switchCameraButton: {
    backgroundColor: 'rgba(30,41,59,0.8)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchCameraText: {
    color: 'white',
    fontSize: 24,
  },
  shutterButton: {
    backgroundColor: '#4f46e5',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#818cf8',
  },
  shutterInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  shutterActive: {
    backgroundColor: '#ffffff',
  },
  shutterInactive: {
    backgroundColor: '#c7d2fe',
  },
});
