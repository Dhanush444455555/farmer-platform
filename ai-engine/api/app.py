from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import uvicorn

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
