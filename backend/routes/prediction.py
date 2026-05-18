import os
import joblib
import numpy as np
from flask import Blueprint, request, jsonify

prediction_bp = Blueprint('prediction', __name__)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'pollution_model.pkl')

@prediction_bp.route('/predict', methods=['GET'])
def get_prediction():
    city = request.args.get('city', 'Delhi')
    try:
        model = joblib.load(os.path.normpath(MODEL_PATH))
    except Exception:
        return jsonify({'error': 'Model not available. Run train_model.py first.'}), 500

    current_pm25 = float(request.args.get('current_pm25', 100))
    hour = int(request.args.get('hour', 12))
    day_of_week = int(request.args.get('day_of_week', 2))
    temperature = float(request.args.get('temperature', 30))

    predictions = []
    features = np.zeros((24, 4))
    for h in range(24):
        features[h] = [current_pm25, (hour + h) % 24, (day_of_week + ((hour + h) // 24)) % 7, temperature]

    predicted = model.predict(features)
    predictions = [round(float(x), 1) for x in predicted]

    return jsonify({
        'city': city,
        'predicted_pm25': predictions,
        'metadata': {
            'current_pm25': current_pm25,
            'hour': hour,
            'day_of_week': day_of_week,
            'temperature': temperature
        }
    })
