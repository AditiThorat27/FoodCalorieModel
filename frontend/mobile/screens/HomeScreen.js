import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { getAllLocalMeals, getUnsyncedMeals, markAsSynced } from '../services/db';
import { saveMeal, getProfile } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Card from '../components/Card';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation();
    const [meals, setMeals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [todayCalories, setTodayCalories] = useState(0);
    const [dailyGoal, setDailyGoal] = useState(2000); // Default
    const [userProfile, setUserProfile] = useState(null);

    const loadData = async () => {
        const localMeals = getAllLocalMeals();
        setMeals(localMeals);

        // Calculate today's calories
        const today = new Date().toDateString();
        const todayTotal = localMeals
            .filter(m => new Date(m.date).toDateString() === today)
            .reduce((sum, m) => sum + (m.totalCalories || 0), 0);
        setTodayCalories(todayTotal);

        try {
            const profileData = await getProfile();
            if (profileData && profileData.profile) {
                setUserProfile(profileData.profile);
                calculateGoal(profileData.profile);
            }
        } catch (error) {
            console.log('Error fetching profile', error);
        }
    };

    const calculateGoal = (profile) => {
        // Mifflin-St Jeor Equation
        // Men: 10W + 6.25H - 5A + 5
        // Women: 10W + 6.25H - 5A - 161
        if (profile.weight && profile.height && profile.dob) {
            const birthDate = new Date(profile.dob);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * age);

            if (profile.gender === 'female') {
                bmr -= 161;
            } else {
                bmr += 5;
            }

            // TDEE = BMR * 1.2 (Sedentary assumption for now)
            const tdee = Math.round(bmr * 1.2);
            setDailyGoal(tdee);
        }
    };

    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        await syncMeals();
        await loadData();
        setRefreshing(false);
    };

    const syncMeals = async () => {
        const unsynced = getUnsyncedMeals();
        for (const meal of unsynced) {
            try {
                await saveMeal({
                    date: meal.date,
                    image: meal.image,
                    foods: meal.foods,
                    totalCalories: meal.totalCalories
                });
                markAsSynced(meal.id);
            } catch (error) {
                console.error('Sync failed for meal', meal.id, error);
            }
        }
    };

    const CircularProgress = ({ value, max }) => {
        const radius = 60;
        const strokeWidth = 12;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(value / max, 1);
        const strokeDashoffset = circumference - progress * circumference;

        return (
            <View style={styles.progressContainer}>
                <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
                    <Circle
                        stroke="rgba(255,255,255,0.2)"
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        stroke="#FFFFFF"
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
                    />
                </Svg>
                <View style={styles.progressTextContainer}>
                    {max - value <= 0 ? (
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={30} color="white" />
                            <Text style={{ ...styles.progressLabel, fontSize: 12, marginTop: 4 }}>Goal Complete!</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.progressValue}>{Math.round(max - value)}</Text>
                            <Text style={styles.progressLabel}>left</Text>
                        </>
                    )}
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Hello!</Text>
                    <Text style={styles.subtitle}>Keep going, you're doing great.</Text>
                </View>
                {/* <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} /> */}
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>Eaten</Text>
                    <Text style={styles.summaryValue}>{Math.round(todayCalories)} <Text style={styles.unit}>kcal</Text></Text>

                    <View style={styles.goalRow}>
                        <Text style={styles.goalLabel}>Goal: {dailyGoal}</Text>
                    </View>
                </View>
                <CircularProgress value={todayCalories} max={dailyGoal} />
            </View>
        </View>
    );

    const renderItem = ({ item }) => (
        <Card style={styles.mealCard}>
            <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.image} />
            <View style={styles.mealInfo}>
                <Text style={styles.mealDate}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.mealCalories}>{Math.round(item.totalCalories)} kcal</Text>
                <View style={styles.badgeContainer}>
                    {item.foods.map((food, idx) => (
                        <Text key={idx} style={styles.foodBadge} numberOfLines={1}>{food.label}</Text>
                    ))}
                </View>
            </View>
            {!item.synced && <Ionicons name="cloud-offline-outline" size={16} color={COLORS.textSecondary} />}
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={meals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        padding: SIZES.padding,
    },
    header: {
        marginBottom: 25,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.textSecondary,
    },
    summaryCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        padding: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: SIZES.font,
        marginBottom: 5,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    unit: {
        fontSize: SIZES.large,
        fontWeight: 'normal',
    },
    goalRow: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    goalLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressValue: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: SIZES.radius / 2,
        marginRight: 15,
    },
    mealInfo: {
        flex: 1,
    },
    mealDate: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    mealCalories: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginVertical: 2,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    foodBadge: {
        fontSize: 10,
        color: COLORS.primary,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
        marginTop: 2,
    },
});
