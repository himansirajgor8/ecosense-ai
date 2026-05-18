import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pollution_model.pkl')

# Generate synthetic training data for pollution prediction
np.random.seed(42)
rows = 1000
current_pm25 = np.random.uniform(20, 220, rows)
hour = np.random.randint(0, 24, rows)
day_of_week = np.random.randint(0, 7, rows)
temperature = np.random.uniform(18, 40, rows)

# Simulate next-hour PM2.5 using a simple noisy formula
next_hour_pm25 = (
    current_pm25 * np.random.uniform(0.92, 1.08, rows)
    + (hour >= 18).astype(float) * np.random.uniform(5, 20, rows)
    + (day_of_week >= 5).astype(float) * np.random.uniform(-5, 5, rows)
    + np.random.normal(0, 8, rows)
)
next_hour_pm25 = np.clip(next_hour_pm25, 10, 280)

train_data = pd.DataFrame({
    'current_pm25': current_pm25,
    'hour': hour,
    'day_of_week': day_of_week,
    'temperature': temperature,
    'next_hour_pm25': next_hour_pm25
})

X = train_data[['current_pm25', 'hour', 'day_of_week', 'temperature']]
y = train_data['next_hour_pm25']

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=120, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, MODEL_PATH)
print(f'Model trained and saved to {MODEL_PATH}')
