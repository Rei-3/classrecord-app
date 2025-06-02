import { CameraView, useCameraPermissions, type CameraViewProps } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { usePosRecordAttendanceMutation } from '@/store/api/apiSlice/postApi/teacher/attendanceSlice';

type BarcodeType = NonNullable<CameraViewProps['barcodeScannerSettings']>['barcodeTypes'][number];

export default function App() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);

  const scanAreaRef = useRef(null);
  const lastBarcodeData = useRef<string | null>(null);
  const steadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { termId } = useLocalSearchParams<{ termId: string }>();
  const termIdParam = parseInt(termId, 10);
  const idParam = parseInt(id, 10);
  const [recordAttendance] = usePosRecordAttendanceMutation();

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

    const studentId = parseInt(data, 10);
    if (isNaN(studentId)) {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid student ID.');
      return;
    }

    steadyTimerRef.current = setTimeout(() => {
      lastBarcodeData.current = data;
      setScanned(true);
      setScanning(false);
      handleRecordAttendance(studentId);
    }, 0);
  };

  const handleRecordAttendance = async (studentId: number) => {
    try {
      const response = await recordAttendance({ teachingLoadDetailId: idParam, termId: termIdParam, studentId }).unwrap();
      console.log('Success response:', response);
      Alert.alert('Success', 'Attendance recorded successfully');
    } catch (err: any) {
      console.log('Error response:', err);
      Alert.alert('Error', err?.data?.message || 'Failed to record attendance');
    }
  };

  const barcodeTypes: BarcodeType[] = ['code39', 'qr'];

  // Show loading screen while permissions are being fetched
  if (permission === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Show permission request screen
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { padding: 24 }]}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera permission to scan barcodes and QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main camera screen
  return (
    <View style={styles.flexFill}>
      <StatusBar style="light" />
      <View style={styles.flexFill}>
        <CameraView
          style={styles.flexFill}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>ID Scanner</Text>
        </View>

        {/* Scan area */}
        <View style={styles.scanAreaContainer}>
          <View
            ref={scanAreaRef}
            style={[
              styles.scanArea,
              { borderColor: scanned ? '#22c55e' /* green-500 */ : '#fff' },
            ]}
          >
            {scanned && (
              <View style={styles.scannedOverlay}>
                <View style={styles.checkmarkContainer}>
                  <View style={styles.checkmarkBg}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {!scanned && scanning && <Text style={styles.scanInstruction}>Position barcode within frame</Text>}

          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
              <Text style={styles.scanAgainButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraFacing}>
            <Text style={styles.toggleButtonText}>⟲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, scanning ? styles.captureButtonActive : styles.captureButtonInactive]}
            onPress={() => {
              if (scanned) resetScan();
            }}
          >
            <View style={[styles.innerCaptureButton, scanning ? styles.innerCaptureActive : styles.innerCaptureInactive]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    backgroundColor: '#1e293b', // slate-800
    padding: 32,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    color: '#cbd5e1', // slate-300
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#4f46e5', // indigo-600
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backdropFilter: 'blur(10px)', // note: backdropFilter not supported on React Native; this will be ignored
    zIndex: 100,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  scanAreaContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 197, 94, 0.125)', // green-500/20
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  checkmarkContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 9999,
  },
  checkmarkBg: {
    backgroundColor: '#22c55e', // green-500
    padding: 8,
    borderRadius: 9999,
  },
  checkmark: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    textAlign: 'center',
  },
  scanInstruction: {
    marginTop: 24,
    color: '#fff',
    fontSize: 18,
  },
  scanAgainButton: {
    marginTop: 32,
    backgroundColor: '#4f46e5', // indigo-600
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'rgba(71, 85, 105, 0.8)', // slate-700/80
    width: 56,
    height: 56,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 28,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6366f1', // indigo-400
  },
  captureButtonActive: {
    borderColor: '#6366f1',
  },
  captureButtonInactive: {
    borderColor: '#a5b4fc', // indigo-300
  },
  innerCaptureButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  innerCaptureActive: {
    backgroundColor: '#fff',
  },
  innerCaptureInactive: {
    backgroundColor: '#c7d2fe', // indigo-300
  },
});
