import joblib
import pandas as pd
import numpy as np

pipe = joblib.load('backend/app/artifacts/conversion_pipeline.joblib')

profiles = {
    'weak_low_engagement': {
        'Age': 22, 'Gender': 'Male', 'Income': 25000, 'CampaignChannel': 'Social Media',
        'CampaignType': 'Awareness', 'AdSpend': 800, 'ClickThroughRate': 0.02,
        'WebsiteVisits': 2, 'PagesPerVisit': 1.1, 'TimeOnSite': 0.8,
        'SocialShares': 2, 'EmailOpens': 1, 'EmailClicks': 0,
        'PreviousPurchases': 0, 'LoyaltyPoints': 20
    },
    'weak_disengaged_older': {
        'Age': 65, 'Gender': 'Female', 'Income': 35000, 'CampaignChannel': 'SEO',
        'CampaignType': 'Awareness', 'AdSpend': 1200, 'ClickThroughRate': 0.04,
        'WebsiteVisits': 4, 'PagesPerVisit': 1.5, 'TimeOnSite': 1.2,
        'SocialShares': 5, 'EmailOpens': 1, 'EmailClicks': 0,
        'PreviousPurchases': 0, 'LoyaltyPoints': 100
    },
    'average_typical_visitor': {
        'Age': 43, 'Gender': 'Male', 'Income': 84000, 'CampaignChannel': 'Email',
        'CampaignType': 'Consideration', 'AdSpend': 5000, 'ClickThroughRate': 0.15,
        'WebsiteVisits': 24, 'PagesPerVisit': 5.0, 'TimeOnSite': 7.0,
        'SocialShares': 50, 'EmailOpens': 8, 'EmailClicks': 4,
        'PreviousPurchases': 4, 'LoyaltyPoints': 2400
    },
    'strong_active_shopper': {
        'Age': 35, 'Gender': 'Female', 'Income': 120000, 'CampaignChannel': 'Email',
        'CampaignType': 'Conversion', 'AdSpend': 8500, 'ClickThroughRate': 0.32,
        'WebsiteVisits': 42, 'PagesPerVisit': 8.5, 'TimeOnSite': 14.0,
        'SocialShares': 75, 'EmailOpens': 16, 'EmailClicks': 10,
        'PreviousPurchases': 8, 'LoyaltyPoints': 4200
    },
    'strong_power_buyer': {
        'Age': 48, 'Gender': 'Male', 'Income': 140000, 'CampaignChannel': 'Referral',
        'CampaignType': 'Conversion', 'AdSpend': 9500, 'ClickThroughRate': 0.40,
        'WebsiteVisits': 50, 'PagesPerVisit': 11.0, 'TimeOnSite': 17.0,
        'SocialShares': 90, 'EmailOpens': 22, 'EmailClicks': 15,
        'PreviousPurchases': 10, 'LoyaltyPoints': 5000
    }
}

print("=== PROFILE PREDICTIONS ===")
for name, p in profiles.items():
    df = pd.DataFrame([p])
    proba = pipe.predict_proba(df)[0]
    pred = pipe.predict(df)[0]
    print(f"{name:25s} -> Prediction: {pred} | Prob(1): {proba[1]:.4f} | Prob(0): {proba[0]:.4f}")
