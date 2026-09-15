"""Reference training script. Run from backend/ after placing the CSV at training/data.csv."""
from pathlib import Path
import json, joblib, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import AdaBoostClassifier
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, confusion_matrix
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE

BASE=Path(__file__).resolve().parents[1]
df=pd.read_csv(Path(__file__).parent/'data.csv')
features=['Age','Gender','Income','CampaignChannel','CampaignType','AdSpend','ClickThroughRate','WebsiteVisits','PagesPerVisit','TimeOnSite','SocialShares','EmailOpens','EmailClicks','PreviousPurchases','LoyaltyPoints']
X,y=df[features],df['Conversion']
cat=['Gender','CampaignChannel','CampaignType']; num=[c for c in features if c not in cat]
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.2,random_state=42,stratify=y)
pre=ColumnTransformer([('num',StandardScaler(),num),('cat',OneHotEncoder(handle_unknown='ignore',sparse_output=False),cat)])
pipe=Pipeline([('preprocessor',pre),('smote',SMOTE(random_state=42)),('model',AdaBoostClassifier(random_state=42,n_estimators=200))])
pipe.fit(Xtr,ytr); pred=pipe.predict(Xte)
print({'accuracy':accuracy_score(yte,pred),'balanced_accuracy':balanced_accuracy_score(yte,pred),'macro_f1':f1_score(yte,pred,average='macro'),'confusion_matrix':confusion_matrix(yte,pred).tolist()})
joblib.dump(pipe,BASE/'app/artifacts/conversion_pipeline.joblib',compress=3)
