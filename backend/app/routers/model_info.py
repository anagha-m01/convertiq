import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix='/api/model', tags=['model'])

def get_artifact(name: str):
    return json.loads((Path(__file__).resolve().parents[1] / 'artifacts' / name).read_text())

@router.get('/metrics')
def metrics():
    return get_artifact('metrics.json')

@router.get('/compare')
def compare():
    return {'items': get_artifact('model_compare.json')}
