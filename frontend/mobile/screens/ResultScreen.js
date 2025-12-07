import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { analyzeImage } from '../services/api';
import { insertMeal } from '../services/db';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ResultScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { imageBase64 } = route.params;
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        processImage();
    }, []);

    const processImage = async () => {
        try {
            const result = await analyzeImage(imageBase64);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            Alert.alert('Analysis Failed', 'Could not identify food. Please try again.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = (index) => {
        const updatedAnalysis = [...analysis];
        updatedAnalysis.splice(index, 1);
        setAnalysis(updatedAnalysis);
    };

    const handleSave = () => {
        if (!analysis) return;

        const totalCalories = analysis.reduce((sum, item) => sum + (item.calories || 0), 0);

        const mealData = {
            date: new Date().toISOString(),
            image: imageBase64,
            foods: analysis,
            totalCalories,
            synced: false
        };

        insertMeal(mealData);
        Alert.alert('Success', 'Meal saved successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Dashboard' }) }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.loadingImage} blurRadius={10} />
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Analyzing your food...</Text>
                </View>
            </View>
        );
    }

    const totalCalories = analysis ? analysis.reduce((sum, item) => sum + (item.calories || 0), 0) : 0;
    const totalProtein = analysis ? analysis.reduce((sum, item) => sum + (item.protein || 0), 0) : 0;
    const totalCarbs = analysis ? analysis.reduce((sum, item) => sum + (item.carbs || 0), 0) : 0;
    const totalFat = analysis ? analysis.reduce((sum, item) => sum + (item.fat || 0), 0) : 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.image} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Analysis Result</Text>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalText}>{Math.round(totalCalories)} kcal</Text>
                        </View>
                    </View>

                    {/* Macros */}
                    <View style={styles.macrosContainer}>
                        <MacroItem label="Protein" value={`${Math.round(totalProtein)}g`} color="#8B5CF6" />
                        <MacroItem label="Carbs" value={`${Math.round(totalCarbs)}g`} color="#F59E0B" />
                        <MacroItem label="Fat" value={`${Math.round(totalFat)}g`} color="#EF4444" />
                    </View>

                    <Text style={styles.sectionTitle}>Detected Items</Text>
                    {analysis && analysis.map((item, index) => (
                        <Card key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>{item.label}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.itemCalories}>{item.calories} kcal</Text>
                                    <TouchableOpacity onPress={() => handleRemoveItem(index)} style={{ marginLeft: 10 }}>
                                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.itemDetail}>{item.weight}g • P: {item.protein}g C: {item.carbs}g F: {item.fat}g</Text>
                        </Card>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Save Meal" onPress={handleSave} />
                <Button title="Retake" onPress={() => navigation.goBack()} type="secondary" style={{ marginTop: 10 }} />
            </View>
        </View>
    );
}

const MacroItem = ({ label, value, color }) => (
    <View style={styles.macroItem}>
        <Text style={[styles.macroValue, { color }]}>{value}</Text>
        <Text style={styles.macroLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, backgroundColor: 'black' },
    loadingImage: { width: '100%', height: '100%', opacity: 0.6 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', marginTop: 20, fontSize: 18, fontWeight: '600' },

    scrollContent: { paddingBottom: 100 },
    image: { width: '100%', height: 300 },
    content: {
        marginTop: -30,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SIZES.padding,
        minHeight: 500
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    totalBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    totalText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        marginBottom: 20,
        ...SHADOWS.light
    },
    macroItem: { alignItems: 'center' },
    macroValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    macroLabel: { fontSize: 12, color: COLORS.textSecondary },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    itemCard: { marginBottom: 10 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    itemCalories: { fontWeight: 'bold', color: COLORS.primary },
    itemDetail: { fontSize: 14, color: COLORS.textSecondary },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    }
});
