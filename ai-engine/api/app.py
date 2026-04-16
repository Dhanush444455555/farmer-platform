from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import time
import random
from pydantic import BaseModel
import uvicorn

class CropRequest(BaseModel):
    crop_name: str

app = FastAPI(title="Farm Platform AI Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ai-health")
def read_health():
    return {"status": "OK", "message": "Farm Platform AI Engine is running."}

@app.post("/analyze-crop")
async def analyze_crop(file: UploadFile = File(...)):
    # Simulate processing time for the AI model
    time.sleep(1.5)
    
    # Generate realistic pseudo-random predictions based on the filename/size
    file_bytes = await file.read()
    seed = len(file_bytes) % 4
    
    DISEASES = [
        {
            "disease": "Leaf Blight (Helminthosporium)",
            "severity": "Moderate",
            "treatment": [
                "🧪 Apply Mancozeb 75% WP @ 2g/litre water",
                "🌿 Remove and destroy infected leaves immediately",
                "💧 Avoid overhead irrigation — use drip instead",
                "🔁 Repeat spray after 10–12 days if symptoms persist"
            ]
        },
        {
            "disease": "Powdery Mildew",
            "severity": "Mild",
            "treatment": [
                "🧪 Spray wettable sulfur @ 2g/litre water",
                "🌬️ Ensure proper air circulation around plants",
                "✂️ Prune overcrowded branches",
                "☀️ Provide adequate sunlight exposure"
            ]
        },
        {
            "disease": "Nitrogen Deficiency",
            "severity": "Severe",
            "treatment": [
                "🌾 Apply Urea or Nitrogen-rich NPK fertilizer",
                "💩 Add organic compost or manure",
                "💧 Ensure soil is sufficiently moist to absorb nutrients",
                "🌱 Consider planting nitrogen-fixing crops next season"
            ]
        },
        {
            "disease": "Healthy Plant (No Issues Detected)",
            "severity": "Mild",
            "treatment": [
                "✅ Continue current watering and feeding schedule",
                "🛡️ Apply preventive neem oil spray once a month",
                "🌱 Monitor for pests regularly"
            ]
        }
    ]
    
    result = DISEASES[seed]
    result["confidence"] = random.randint(82, 98)
    
    return result

class InsuranceRiskRequest(BaseModel):
    crop_name: str
    state: str
    sum_insured: int

@app.post("/analyze-insurance-risk")
async def analyze_insurance_risk(request: InsuranceRiskRequest):
    time.sleep(1.2) # Simulate processing
    risk_factors = ["Weather Volatility", "Pest History", "Market Fluctuation", "Soil Degradation"]
    
    # Calculate simulated dynamic risk index
    base_risk = random.randint(10, 40)
    if request.state.lower() in ["maharashtra", "gujarat"]:
        base_risk += 15 # Drought risk
    if request.crop_name.lower() in ["cotton", "sugarcane"]:
        base_risk += 10 # Cash crop volatility
        
    recommended_premium = max(1.5, round((base_risk * 0.1), 2))
    
    return {
        "crop": request.crop_name,
        "state": request.state,
        "risk_index": base_risk,
        "primary_risk": random.choice(risk_factors),
        "ai_recommended_premium_rate": f"{recommended_premium}%",
        "market_viability": "High" if base_risk < 35 else "Moderate"
    }

@app.post("/crop-maintenance")
async def crop_maintenance(request: CropRequest):
    # Simulate processing time for the AI model
    time.sleep(0.8)
    
    crop = request.crop_name.lower().strip()
    
    # Simple simulated knowledge base
    rules = {
        "tomato": ["Water daily at the base.", "Prune lower leaves to prevent blight.", "Apply nitrogen-rich fertilizer every 2 weeks."],
        "wheat": ["Water every 3-4 days.", "Monitor for rust and aphids.", "Apply Urea (Nitrogen) if yellowing occurs."],
        "corn": ["Heavy watering required during silking.", "Side-dress with nitrogen when knee-high.", "Watch for corn borers."],
        "rice": ["Maintain continuous flooding (2-5 cm).", "Apply top dressing 30 days after transplanting.", "Check for stem borers."],
        "potato": ["Water consistently to keep soil moist.", "Hill up soil around stems as they grow.", "Spray for potato beetles if seen."]
    }
    
    # Generic fallback
    default_maintenance = [
        "Water moderately based on soil moisture.",
        "Check closely for common pests.",
        "Apply basic balanced NPK fertilizer."
    ]
    
    # Find matching crop or fallback
    maintenance_tasks = default_maintenance
    for key, value in rules.items():
        if key in crop:
            maintenance_tasks = value
            break
            
    return {
        "crop": request.crop_name,
        "daily_maintenance": maintenance_tasks,
        "confidence": random.randint(85, 99)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
