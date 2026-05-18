from flask import Flask
from flask_cors import CORS
from routes.air_quality import air_quality_bp
from routes.prediction import prediction_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(air_quality_bp, url_prefix='/api')
app.register_blueprint(prediction_bp, url_prefix='/api')

@app.route('/')
def health_check():
    return {'status': 'EcoSense AI backend running'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
