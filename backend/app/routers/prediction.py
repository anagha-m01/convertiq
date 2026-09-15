from fastapi import APIRouter
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import predict_conversion

router = APIRouter(prefix='/api', tags=['prediction'])

@router.post('/predict', response_model=PredictionResponse)
def predict(body: PredictionRequest):
    return predict_conversion(body.model_dump())
