import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('calories.db');

export const initDB = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            image TEXT,
            foods TEXT,
            totalCalories INTEGER,
            synced INTEGER DEFAULT 0
        );
    `);
};

export const insertMeal = (meal) => {
    const { date, image, foods, totalCalories, synced } = meal;
    db.runSync(
        'INSERT INTO meals (date, image, foods, totalCalories, synced) VALUES (?, ?, ?, ?, ?)',
        [date, image, JSON.stringify(foods), totalCalories, synced ? 1 : 0]
    );
};

export const getUnsyncedMeals = () => {
    const result = db.getAllSync('SELECT * FROM meals WHERE synced = 0');
    return result.map(row => ({
        ...row,
        foods: JSON.parse(row.foods)
    }));
};

export const markAsSynced = (id) => {
    db.runSync('UPDATE meals SET synced = 1 WHERE id = ?', [id]);
};

export const getAllLocalMeals = () => {
    const result = db.getAllSync('SELECT * FROM meals ORDER BY date DESC');
    return result.map(row => ({
        ...row,
        foods: JSON.parse(row.foods)
    }));
};
