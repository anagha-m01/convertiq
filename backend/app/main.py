import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import prediction, analytics, model_info

app=FastAPI(title='ConvertIQ API', version='1.0.0')
origins=[o.strip() for o in os.getenv('ALLOWED_ORIGINS','http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000').split(',') if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=['GET','POST','OPTIONS'], allow_headers=['*'])
app.include_router(prediction.router)
app.include_router(analytics.router)
app.include_router(model_info.router)

@app.get('/api/health')
def health():
    return {'status':'ok','model_loaded':True,'model':'AdaBoostClassifier'}
