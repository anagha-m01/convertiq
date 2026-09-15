import pandas as pd
import numpy as np
import json
from pathlib import Path

df = pd.read_csv('backend/training/data.csv')

# 1. Feature Correlation Matrix
corr_features = [
    'AdSpend', 'ClickThroughRate', 'WebsiteVisits', 'PagesPerVisit',
    'TimeOnSite', 'SocialShares', 'EmailOpens', 'EmailClicks',
    'PreviousPurchases', 'LoyaltyPoints', 'Conversion'
]
corr_df = df[corr_features].corr().round(2)

# Matrix format for heatmap
corr_matrix = {
    'features': corr_features,
    'matrix': corr_df.values.tolist(),
    'pairs': []
}
for i, f1 in enumerate(corr_features):
    for j, f2 in enumerate(corr_features):
        corr_matrix['pairs'].append({
            'x': f1,
            'y': f2,
            'value': float(corr_df.iloc[i, j])
        })

# 2. Gender Distribution & Conversion
gender_stats = []
for g in ['Female', 'Male']:
    sub = df[df['Gender'] == g]
    total = len(sub)
    converted = int((sub['Conversion'] == 1).sum())
    rate = round(converted / total, 4)
    gender_stats.append({
        'gender': g,
        'total': total,
        'percentage': round(total / len(df) * 100, 1),
        'converted': converted,
        'not_converted': total - converted,
        'conversion_rate': rate,
        'avg_income': round(float(sub['Income'].mean()), 2),
        'avg_ad_spend': round(float(sub['AdSpend'].mean()), 2),
        'avg_ctr': round(float(sub['ClickThroughRate'].mean()), 4)
    })

# 3. Ad Spend vs Conversion Boxplot & Tier Stats
spend_by_conversion = {}
for c in [0, 1]:
    sub = df[df['Conversion'] == c]['AdSpend']
    spend_by_conversion[str(c)] = {
        'label': 'Converted (1)' if c == 1 else 'Not Converted (0)',
        'count': int(len(sub)),
        'mean': round(float(sub.mean()), 2),
        'std': round(float(sub.std()), 2),
        'min': round(float(sub.min()), 2),
        'q1': round(float(sub.quantile(0.25)), 2),
        'median': round(float(sub.median()), 2),
        'q3': round(float(sub.quantile(0.75)), 2),
        'max': round(float(sub.max()), 2)
    }

# Spend tiers
bins = [0, 2500, 5000, 7500, 100000]
labels = ['Low (<$2.5k)', 'Medium ($2.5k-$5k)', 'High ($5k-$7.5k)', 'Premium (>$7.5k)']
df['spend_tier'] = pd.cut(df['AdSpend'], bins=bins, labels=labels)
spend_tier_stats = []
for tier in labels:
    sub = df[df['spend_tier'] == tier]
    tot = len(sub)
    conv = int((sub['Conversion'] == 1).sum())
    spend_tier_stats.append({
        'tier': tier,
        'records': tot,
        'converted': conv,
        'conversion_rate': round(conv / tot, 4) if tot > 0 else 0,
        'avg_ad_spend': round(float(sub['AdSpend'].mean()), 2) if tot > 0 else 0
    })

# 4. Age Group Distribution
age_bins = [17, 25, 35, 50, 100]
age_labels = ['18-25', '26-35', '36-50', '50+']
df['age_group'] = pd.cut(df['Age'], bins=age_bins, labels=age_labels)
age_group_stats = []
for grp in age_labels:
    sub = df[df['age_group'] == grp]
    tot = len(sub)
    conv = int((sub['Conversion'] == 1).sum())
    age_group_stats.append({
        'group': grp,
        'records': tot,
        'percentage': round(tot / len(df) * 100, 1),
        'converted': conv,
        'conversion_rate': round(conv / tot, 4) if tot > 0 else 0
    })

# Load existing analytics.json to preserve overview, channels, campaigns
analytics_path = Path('backend/app/artifacts/analytics.json')
current = json.loads(analytics_path.read_text())

# Update with new rich data
current['correlation'] = corr_matrix
current['gender_distribution'] = gender_stats
current['ad_spend_by_conversion'] = spend_by_conversion
current['spend_tier_stats'] = spend_tier_stats
current['age_group_stats'] = age_group_stats

analytics_path.write_text(json.dumps(current, indent=2))
print("Successfully computed and saved enriched analytics to analytics.json")
