from pathlib import Path
import joblib
import pandas as pd

ARTIFACT = Path(__file__).resolve().parents[1] / 'artifacts' / 'conversion_pipeline.joblib'
MODEL = joblib.load(ARTIFACT)

FEATURE_MAP = {
    'age':'Age','gender':'Gender','income':'Income','campaign_channel':'CampaignChannel',
    'campaign_type':'CampaignType','ad_spend':'AdSpend','click_through_rate':'ClickThroughRate',
    'website_visits':'WebsiteVisits','pages_per_visit':'PagesPerVisit','time_on_site':'TimeOnSite',
    'social_shares':'SocialShares','email_opens':'EmailOpens','email_clicks':'EmailClicks',
    'previous_purchases':'PreviousPurchases','loyalty_points':'LoyaltyPoints'
}

def predict_conversion(payload: dict) -> dict:
    row = {FEATURE_MAP[k]: v for k,v in payload.items()}
    frame = pd.DataFrame([row])
    probability = float(MODEL.predict_proba(frame)[0,1])
    prediction = int(probability >= 0.5)
    return {
        'prediction': prediction,
        'label': 'Likely to Convert' if prediction else 'Unlikely to Convert',
        'probability': round(probability, 4),
        'model_name': 'AdaBoostClassifier'
    }
