import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score,
    precision_recall_curve, auc, accuracy_score, balanced_accuracy_score, f1_score
)
from sklearn.model_selection import train_test_split

df = pd.read_csv('backend/training/data.csv')
features = [
    'Age','Gender','Income','CampaignChannel','CampaignType','AdSpend',
    'ClickThroughRate','WebsiteVisits','PagesPerVisit','TimeOnSite',
    'SocialShares','EmailOpens','EmailClicks','PreviousPurchases','LoyaltyPoints'
]
X, y = df[features], df['Conversion']

pipe = joblib.load('backend/app/artifacts/conversion_pipeline.joblib')

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

y_pred = pipe.predict(X_test)
y_proba = pipe.predict_proba(X_test)[:, 1]

cm = confusion_matrix(y_test, y_pred)
acc = accuracy_score(y_test, y_pred)
bal_acc = balanced_accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average='macro')
roc = roc_auc_score(y_test, y_proba)
p_curve, r_curve, _ = precision_recall_curve(y_test, y_proba)
pr_auc = auc(r_curve, p_curve)

# Majority class dummy baseline
dummy_pred = np.ones_like(y_test)
dummy_acc = accuracy_score(y_test, dummy_pred)
dummy_bal_acc = balanced_accuracy_score(y_test, dummy_pred)
dummy_f1 = f1_score(y_test, dummy_pred, average='macro')

print("================ MODEL EVALUATION SUMMARY ================")
print(f"Total dataset size: {len(df)} samples")
print(f"Class 0 (Non-converter): {(y == 0).sum()} ({(y == 0).mean()*100:.2f}%)")
print(f"Class 1 (Converter):     {(y == 1).sum()} ({(y == 1).mean()*100:.2f}%)")
print(f"Test size: {len(y_test)} samples (Class 0: {(y_test == 0).sum()}, Class 1: {(y_test == 1).sum()})")
print("\n--- Accuracy vs Baseline ---")
print(f"AdaBoost Test Accuracy:     {acc*100:.2f}%")
print(f"Majority Baseline Accuracy: {dummy_acc*100:.2f}%")
print(f"Balanced Accuracy:          {bal_acc*100:.2f}% (Dummy: {dummy_bal_acc*100:.2f}%)")
print(f"Macro F1 Score:             {macro_f1:.4f} (Dummy: {dummy_f1:.4f})")
print(f"ROC-AUC:                    {roc:.4f}")
print(f"PR-AUC:                     {pr_auc:.4f}")
print("\n--- Confusion Matrix (rows: True, cols: Predicted) ---")
print(f"True Non-Converter (0): TN={cm[0,0]} | FP={cm[0,1]}")
print(f"True Converter     (1): FN={cm[1,0]} | TP={cm[1,1]}")
print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred, target_names=['Class 0 (Non-Converter)', 'Class 1 (Converter)'], digits=4))

# Check feature importances from AdaBoost
model_step = pipe.named_steps['model']
preprocessor = pipe.named_steps['preprocessor']
cat_cols = preprocessor.named_transformers_['cat'].get_feature_names_out(['Gender','CampaignChannel','CampaignType'])
num_cols = [c for c in features if c not in ['Gender','CampaignChannel','CampaignType']]
all_cols = list(num_cols) + list(cat_cols)
importances = pd.Series(model_step.feature_importances_, index=all_cols).sort_values(ascending=False)
print("\n--- Top 10 Feature Importances ---")
print(importances.head(10))
