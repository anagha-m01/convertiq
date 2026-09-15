from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    age: int = Field(ge=18, le=100)
    gender: Literal['Male','Female']
    income: float = Field(ge=0, le=50000000)
    campaign_channel: Literal['Email','PPC','Referral','SEO','Social Media']
    campaign_type: Literal['Awareness','Consideration','Conversion','Retention']
    ad_spend: float = Field(ge=0, le=500000)
    click_through_rate: float = Field(ge=0, le=1)
    website_visits: int = Field(ge=0, le=10000)
    pages_per_visit: float = Field(ge=0, le=100)
    time_on_site: float = Field(ge=0, le=1000)
    social_shares: int = Field(ge=0, le=100000)
    email_opens: int = Field(ge=0, le=100000)
    email_clicks: int = Field(ge=0, le=100000)
    previous_purchases: int = Field(ge=0, le=10000)
    loyalty_points: float = Field(ge=0, le=1000000)

class PredictionResponse(BaseModel):
    prediction: int
    label: str
    probability: float
    model_name: str
