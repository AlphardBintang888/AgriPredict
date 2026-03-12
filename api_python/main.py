from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import math

app = FastAPI(title="AgriPredict ML Engine")

# Mengizinkan akses dari front-end origin mana pun untuk percobaan ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/predict")
def predict_commodity_prices(commodity: str = 'cabai', days: int = 10):
    """
    Endpoint ini mensimulasikan pemrosesan Algoritma Holt-Winters
    berdasarkan data historis untuk memprediksi harga komoditas x hari ke depan.
    """
    
    # Generate data historis (30 hari ke belakang)
    labels_hist = [f"Hari-{i+1}" for i in range(30)]
    
    # Base harga berdasarkan komoditas
    base_price = 40000
    if commodity == 'bawang':
        base_price = 25000
    elif commodity == 'beras':
        base_price = 15000
        
    aktual_hist = [math.floor(base_price + random.uniform(-2000, 2000)) for _ in range(30)]
    
    # Mensimulasikan data prediksi di masa lalu vs aktual
    prediksi_hist = [math.floor(aktual + random.uniform(-1000, 1000)) for aktual in aktual_hist]
    
    # Generate prediksi x hari ke depan (Future Prediction)
    future_labels = [f"+{i+1} Hari" for i in range(days)]
    last_price = aktual_hist[-1]
    
    # Mensimulasikan tren naik
    future_predict = []
    current_trend = last_price
    for _ in range(days):
        current_trend += random.uniform(200, 800) # Harga diprediksi naik pelan
        future_predict.append(math.floor(current_trend))
        
    return {
        "status": "success",
        "commodity": commodity,
        "algorithm": "Holt-Winters Exponential Smoothing",
        "mape_accuracy": 94.8,
        "historical_data": {
            "labels": labels_hist,
            "actual_prices": aktual_hist,
            "fitted_prices": prediksi_hist
        },
        "future_prediction": {
            "labels": future_labels,
            "predicted_prices": future_predict
        }
    }
