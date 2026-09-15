from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def sample_strong():
    return {
        'age': 35, 'gender': 'Female', 'income': 120000,
        'campaign_channel': 'Email', 'campaign_type': 'Conversion',
        'ad_spend': 8500, 'click_through_rate': 0.32,
        'website_visits': 42, 'pages_per_visit': 8.5, 'time_on_site': 14.0,
        'social_shares': 75, 'email_opens': 16, 'email_clicks': 10,
        'previous_purchases': 8, 'loyalty_points': 4200
    }

def sample_weak():
    return {
        'age': 22, 'gender': 'Male', 'income': 25000,
        'campaign_channel': 'Social Media', 'campaign_type': 'Awareness',
        'ad_spend': 800, 'click_through_rate': 0.02,
        'website_visits': 2, 'pages_per_visit': 1.1, 'time_on_site': 0.8,
        'social_shares': 2, 'email_opens': 1, 'email_clicks': 0,
        'previous_purchases': 0, 'loyalty_points': 20
    }

def test_health():
    r = client.get('/api/health')
    assert r.status_code == 200
    data = r.json()
    assert data['status'] == 'ok'
    assert data['model_loaded'] is True
    assert data['model'] == 'AdaBoostClassifier'

def test_analytics_endpoints():
    r_overview = client.get('/api/analytics/overview')
    assert r_overview.status_code == 200
    ov = r_overview.json()
    assert ov['total_customers'] == 8000
    assert ov['converted'] == 7012

    r_channels = client.get('/api/analytics/channels')
    assert r_channels.status_code == 200
    assert len(r_channels.json()['items']) == 5

    r_campaigns = client.get('/api/analytics/campaigns')
    assert r_campaigns.status_code == 200
    assert len(r_campaigns.json()['items']) == 4

def test_model_metrics():
    r = client.get('/api/model/metrics')
    assert r.status_code == 200
    metrics = r.json()
    assert metrics['selected_model'] == 'AdaBoostClassifier'
    assert 'accuracy' in metrics
    assert 'confusion_matrix' in metrics

def test_predict_both_classes():
    # Strong profile should predict 1 (Likely to Convert)
    r_strong = client.post('/api/predict', json=sample_strong())
    assert r_strong.status_code == 200
    body_strong = r_strong.json()
    assert body_strong['prediction'] == 1
    assert body_strong['label'] == 'Likely to Convert'
    assert body_strong['probability'] >= 0.5

    # Weak profile should predict 0 (Unlikely to Convert)
    r_weak = client.post('/api/predict', json=sample_weak())
    assert r_weak.status_code == 200
    body_weak = r_weak.json()
    assert body_weak['prediction'] == 0
    assert body_weak['label'] == 'Unlikely to Convert'
    assert body_weak['probability'] < 0.5

def test_validation_errors():
    # Invalid CTR (> 1.0)
    p1 = sample_strong()
    p1['click_through_rate'] = 1.5
    assert client.post('/api/predict', json=p1).status_code == 422

    # Underage (< 18)
    p2 = sample_strong()
    p2['age'] = 15
    assert client.post('/api/predict', json=p2).status_code == 422

    # Invalid gender category
    p3 = sample_strong()
    p3['gender'] = 'Other'
    assert client.post('/api/predict', json=p3).status_code == 422

    # Extra disallowed field (extra='forbid')
    p4 = sample_strong()
    p4['unknown_field'] = 123
    assert client.post('/api/predict', json=p4).status_code == 422

    # Missing required field
    p5 = sample_strong()
    del p5['ad_spend']
    assert client.post('/api/predict', json=p5).status_code == 422

def test_cors_headers():
    r = client.options(
        '/api/predict',
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
        }
    )
    assert r.status_code == 200
    assert r.headers.get('access-control-allow-origin') == 'http://localhost:5173'
