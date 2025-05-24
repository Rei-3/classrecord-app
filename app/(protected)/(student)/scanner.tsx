import { CameraView, useCameraPermissions, type CameraViewProps } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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

    // If the QR code contains just the hash as a string
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
      const response = await enroll({hashKey}).unwrap();
      console.log('Success response:', response);
      Alert.alert('Success', 'Enrollment successful!');
    } catch (err: any) {
      console.log('Error response:', err);
      Alert.alert('Error', err?.data?.message || 'Failed to enroll in subject.');
    }
  };

  const barcodeTypes: BarcodeType[] = ['qr'];

  // === RENDERING ===

  if (permission === null) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-6">
        <View className="bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <Text className="text-white text-2xl font-bold mb-4 text-center">Camera Access Required</Text>
          <Text className="text-slate-300 text-base mb-8 text-center">
            We need camera permission to scan barcodes and QR codes.
          </Text>
          <TouchableOpacity className="bg-indigo-600 py-4 px-6 rounded-xl" onPress={requestPermission}>
            <Text className="text-white text-center font-bold text-lg">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={StyleSheet.absoluteFillObject}>
      <StatusBar style="light" />

      <View style={StyleSheet.absoluteFillObject}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Header */}
        <View className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-md pt-12 pb-4 px-4">
          <Text className="text-white text-xl font-bold text-center">Scan to Enroll a Subject</Text>
        </View>

        {/* Scan Area */}
        <View className="absolute inset-0 justify-center items-center">
          <View
            ref={scanAreaRef}
            className={`w-64 h-64 border-2 rounded-lg ${scanned ? 'border-green-500' : 'border-white'}`}
          >
            {scanned && (
              <View className="absolute inset-0 bg-green-500/20 justify-center items-center">
                <View className="bg-white/90 p-3 rounded-full">
                  <View className="bg-green-500 p-2 rounded-full">
                    <Text className="text-white font-bold text-xl">✓</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {!scanned && scanning && (
            <Text className="text-white mt-6 text-lg">Position barcode within frame</Text>
          )}

          {scanned && (
            <TouchableOpacity
              className="bg-indigo-600 py-3 px-8 rounded-xl mt-8"
              onPress={resetScan}
            >
              <Text className="text-white font-bold text-lg">Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-6 flex-row justify-around">
          <TouchableOpacity
            className="bg-slate-800/80 w-14 h-14 rounded-full justify-center items-center"
            onPress={toggleCameraFacing}
          >
            <Text className="text-white text-2xl">⟲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-indigo-600 w-16 h-16 rounded-full justify-center items-center border-4 border-indigo-400"
            onPress={() => {
              if (scanned) {
                resetScan();
              }
            }}
          >
            <View className={`w-8 h-8 rounded-sm ${scanning ? 'bg-white' : 'bg-indigo-300'}`} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
