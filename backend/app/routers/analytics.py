import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix='/api/analytics', tags=['analytics'])

def get_data():
    return json.loads((Path(__file__).resolve().parents[1] / 'artifacts' / 'analytics.json').read_text())

@router.get('/overview')
def overview():
    return get_data()['overview']

@router.get('/channels')
def channels():
    return {'items': get_data()['channels']}

@router.get('/campaigns')
def campaigns():
    return {'items': get_data()['campaigns']}

@router.get('/correlation')
def correlation():
    return get_data().get('correlation', {})

@router.get('/demographics')
def demographics():
    data = get_data()
    return {
        'gender': data.get('gender_distribution', []),
        'age': data.get('age_group_stats', [])
    }

@router.get('/adspend')
def adspend():
    data = get_data()
    return {
        'by_conversion': data.get('ad_spend_by_conversion', {}),
        'by_tier': data.get('spend_tier_stats', [])
    }

@router.get('/full')
def full_analytics():
    return get_data()
