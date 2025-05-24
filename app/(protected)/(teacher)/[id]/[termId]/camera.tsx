import { CameraView, useCameraPermissions, type CameraViewProps } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { usePosRecordAttendanceMutation } from '@/store/api/apiSlice/postApi/teacher/attendanceSlice';

type BarcodeType = NonNullable<CameraViewProps['barcodeScannerSettings']>['barcodeTypes'][number];

export default function App() {
  // Hooks at the top
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);

  const scanAreaRef = useRef(null);
  const lastBarcodeData = useRef<string | null>(null);
  const steadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const {termId} = useLocalSearchParams<{termId: string}>();
  const termIdParam = parseInt(termId, 10)
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
        Alert.alert("Success", "Attendance recorded successfully");
      } catch (err: any) {
        console.log('Error response:', err);
        Alert.alert("Error", err?.data?.message || "Failed to record attendance");
      }
  };

  const barcodeTypes: BarcodeType[] = ['code39', 'qr'];

  // === RENDERING ===

  // Show loading screen while permissions are being fetched
  if (permission === null) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Show permission request screen
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-6">
        <View className="bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <Text className="text-white text-2xl font-bold mb-4 text-center">Camera Access Required</Text>
          <Text className="text-slate-300 text-base mb-8 text-center">
            We need camera permission to scan barcodes and QR codes.
          </Text>
          <TouchableOpacity
            className="bg-indigo-600 py-4 px-6 rounded-xl"
            onPress={requestPermission}
          >
            <Text className="text-white text-center font-bold text-lg">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main camera screen
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
          <Text className="text-white text-xl font-bold text-center">ID Scanner</Text>
        </View>

        {/* Scan area */}
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

        {/* Bottom controls */}
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
