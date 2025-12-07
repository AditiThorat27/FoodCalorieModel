import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllLocalMeals } from '../services/db';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Card from '../components/Card';

export default function LogsScreen() {
    const navigation = useNavigation();
    const [groupedMeals, setGroupedMeals] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadLogs();
        const unsubscribe = navigation.addListener('focus', loadLogs);
        return unsubscribe;
    }, [navigation]);

    const loadLogs = () => {
        const meals = getAllLocalMeals();

        // Group by date
        const groups = meals.reduce((acc, meal) => {
            const date = new Date(meal.date);
            const dateKey = date.toDateString(); // "Fri Nov 29 2024"

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: date,
                    dateString: dateKey,
                    totalCalories: 0,
                    meals: []
                };
            }

            acc[dateKey].totalCalories += (meal.totalCalories || 0);
            acc[dateKey].meals.push(meal);
            return acc;
        }, {});

        // Convert to array and sort by date descending
        const sortedGroups = Object.values(groups).sort((a, b) => b.date - a.date);
        setGroupedMeals(sortedGroups);
    };

    const handleDayPress = (dayGroup) => {
        setSelectedDay(dayGroup);
        setModalVisible(true);
    };

    const renderDayCard = ({ item }) => (
        <TouchableOpacity onPress={() => handleDayPress(item)}>
            <Card style={styles.dayCard}>
                <View style={styles.dayInfo}>
                    <Text style={styles.dayDate}>{item.dateString}</Text>
                    <Text style={styles.dayCalories}>{Math.round(item.totalCalories)} kcal</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </Card>
        </TouchableOpacity>
    );

    const renderMealItem = ({ item }) => (
        <View style={styles.mealItem}>
            <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.mealImage} />
            <View style={styles.mealContent}>
                <Text style={styles.mealTime}>
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={styles.foodTags}>
                    {item.foods.map((food, idx) => (
                        <Text key={idx} style={styles.foodTag}>{food.label}</Text>
                    ))}
                </View>
            </View>
            <Text style={styles.mealItemCalories}>{Math.round(item.totalCalories)} kcal</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Meal Logs</Text>

            <FlatList
                data={groupedMeals}
                keyExtractor={(item) => item.dateString}
                renderItem={renderDayCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="journal-outline" size={50} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No meals logged yet.</Text>
                    </View>
                }
            />

            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedDay?.dateString}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSummary}>
                            <Text style={styles.modalSummaryText}>Total Intake</Text>
                            <Text style={styles.modalSummaryValue}>{Math.round(selectedDay?.totalCalories || 0)} kcal</Text>
                        </View>

                        <FlatList
                            data={selectedDay?.meals}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderMealItem}
                            contentContainerStyle={styles.modalList}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    listContent: { padding: SIZES.padding },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: COLORS.text, margin: SIZES.padding, marginBottom: 10 },

    dayCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 15,
    },
    dayInfo: { flex: 1 },
    dayDate: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
    dayCalories: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, color: COLORS.textSecondary, fontSize: 16 },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '80%',
        padding: SIZES.padding,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },

    modalSummary: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        ...SHADOWS.light,
    },
    modalSummaryText: { fontSize: 16, color: COLORS.textSecondary },
    modalSummaryValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },

    modalList: { paddingBottom: 20 },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        ...SHADOWS.light,
    },
    mealImage: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
    mealContent: { flex: 1 },
    mealTime: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
    foodTags: { flexDirection: 'row', flexWrap: 'wrap' },
    foodTag: {
        fontSize: 12,
        color: COLORS.text,
        backgroundColor: COLORS.inputBg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 5
    },
    mealItemCalories: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
});
