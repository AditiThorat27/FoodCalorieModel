import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    if (!permission) {
        return <View style={{ flex: 1, backgroundColor: 'black' }} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need camera access to scan your food.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            setLoading(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
                navigation.navigate('Result', { imageBase64: photo.base64 });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                navigation.navigate('Result', { imageBase64: result.assets[0].base64 });
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <CameraView style={styles.camera} ref={cameraRef} />

            {/* Overlay */}
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <Text style={styles.hintText}>Capture your meal in good lighting</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Ionicons name="images-outline" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutterButton} onPress={takePicture} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.primary} size="large" />
                        ) : (
                            <View style={styles.shutterInner} />
                        )}
                    </TouchableOpacity>

                    <View style={{ width: 50 }} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    camera: { flex: 1, width: '100%' },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    permissionText: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 50,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 10,
        borderRadius: 20,
        alignSelf: 'center',
    },
    hintText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    galleryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    shutterInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
    },
});
