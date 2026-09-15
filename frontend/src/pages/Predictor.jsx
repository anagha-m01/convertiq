import React, { useState } from 'react';
import { api } from '../services/api';

const PRESETS = {
  strong: {
    title: 'Strong Converter (Repeat Buyer)',
    data: {
      age: '35',
      gender: 'Female',
      income: '120000',
      campaign_channel: 'Email',
      campaign_type: 'Conversion',
      ad_spend: '8500',
      click_through_rate: '0.32',
      website_visits: '42',
      pages_per_visit: '8.5',
      time_on_site: '14.0',
      social_shares: '75',
      email_opens: '16',
      email_clicks: '10',
      previous_purchases: '8',
      loyalty_points: '4200'
    }
  },
  weak: {
    title: 'Weak / At-Risk Prospect',
    data: {
      age: '22',
      gender: 'Male',
      income: '25000',
      campaign_channel: 'Social Media',
      campaign_type: 'Awareness',
      ad_spend: '800',
      click_through_rate: '0.02',
      website_visits: '2',
      pages_per_visit: '1.1',
      time_on_site: '0.8',
      social_shares: '2',
      email_opens: '1',
      email_clicks: '0',
      previous_purchases: '0',
      loyalty_points: '20'
    }
  },
  average: {
    title: 'Average Prospect',
    data: {
      age: '43',
      gender: 'Male',
      income: '84000',
      campaign_channel: 'Email',
      campaign_type: 'Consideration',
      ad_spend: '5000',
      click_through_rate: '0.15',
      website_visits: '24',
      pages_per_visit: '5.0',
      time_on_site: '7.0',
      social_shares: '50',
      email_opens: '8',
      email_clicks: '4',
      previous_purchases: '4',
      loyalty_points: '2400'
    }
  }
};

const initial = {
  age: '',
  gender: 'Female',
  income: '',
  campaign_channel: 'Email',
  campaign_type: 'Conversion',
  ad_spend: '',
  click_through_rate: '',
  website_visits: '',
  pages_per_visit: '',
  time_on_site: '',
  social_shares: '',
  email_opens: '',
  email_clicks: '',
  previous_purchases: '',
  loyalty_points: ''
};

const FIELD_META = [
  { name: 'age', label: 'Age', type: 'number', min: 18, max: 100, step: 1, hint: '18 – 100' },
  { name: 'income', label: 'Annual Income ($)', type: 'number', min: 0, max: 50000000, step: 'any', hint: 'up to $50,000,000' },
  { name: 'ad_spend', label: 'Ad Spend ($)', type: 'number', min: 0, max: 500000, step: 'any', hint: 'up to $500,000' },
  { name: 'click_through_rate', label: 'Click Through Rate', type: 'number', min: 0, max: 1, step: 'any', hint: '0.00 – 1.00' },
  { name: 'website_visits', label: 'Website Visits', type: 'number', min: 0, max: 10000, step: 1, hint: '0 – 10,000' },
  { name: 'pages_per_visit', label: 'Pages Per Visit', type: 'number', min: 0, max: 100, step: 'any', hint: '0 – 100' },
  { name: 'time_on_site', label: 'Time On Site (min)', type: 'number', min: 0, max: 1000, step: 'any', hint: '0 – 1,000' },
  { name: 'social_shares', label: 'Social Shares', type: 'number', min: 0, max: 100000, step: 1, hint: 'count' },
  { name: 'email_opens', label: 'Email Opens', type: 'number', min: 0, max: 100000, step: 1, hint: 'count' },
  { name: 'email_clicks', label: 'Email Clicks', type: 'number', min: 0, max: 100000, step: 1, hint: 'count' },
  { name: 'previous_purchases', label: 'Previous Purchases', type: 'number', min: 0, max: 10000, step: 1, hint: '0 – 10,000' },
  { name: 'loyalty_points', label: 'Loyalty Points', type: 'number', min: 0, max: 1000000, step: 'any', hint: 'balance' }
];

export default function Predictor() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState(null);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorField === e.target.name) {
      setErrorField(null);
      setError('');
    }
  };

  const loadPreset = (key) => {
    setForm({ ...PRESETS[key].data });
    setResult(null);
    setError('');
    setErrorField(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorField(null);
    setResult(null);

    try {
      const numeric = FIELD_META.map((f) => f.name);
      const payload = { ...form };
      numeric.forEach((k) => (payload[k] = Number(payload[k])));

      const r = await api.post('/api/predict', payload);
      setResult(r.data);
    } catch (err) {
      console.error('Prediction API Error:', err.response?.data || err);
      if (err.response?.data?.detail) {
        const details = err.response.data.detail;
        if (Array.isArray(details) && details.length > 0) {
          const first = details[0];
          const fieldKey = first.loc?.[first.loc.length - 1];
          setErrorField(fieldKey);
          const meta = FIELD_META.find((f) => f.name === fieldKey);
          const fieldLabel = meta?.label || fieldKey;

          let msg = first.msg;
          if (first.type === 'less_than_equal') {
            msg = `must be less than or equal to ${first.ctx?.le?.toLocaleString()}`;
          } else if (first.type === 'greater_than_equal') {
            msg = `must be greater than or equal to ${first.ctx?.ge?.toLocaleString()}`;
          }
          setError(`Validation Error on [${fieldLabel}]: ${msg}`);
        } else if (typeof details === 'string') {
          setError(`Validation Error: ${details}`);
        } else {
          setError('Validation Error: Please check entered values.');
        }
      } else {
        setError('Prediction failed. Please ensure the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="predictorWrapper">
      <div className="sectionTitle">
        <span className="eyebrow">LIVE MODEL INFERENCE</span>
        <h2>Predict Customer Conversion</h2>
        <p>
          Evaluate any prospective customer profile through the trained AdaBoost + SMOTE classification pipeline.
        </p>
      </div>

      {/* Quick Presets Bar */}
      <div className="presetBar">
        <span className="presetLabel">⚡ Instant Profile Presets:</span>
        <button
          type="button"
          className="presetBtn strong"
          onClick={() => loadPreset('strong')}
        >
          ✓ Load Strong Converter
        </button>
        <button
          type="button"
          className="presetBtn weak"
          onClick={() => loadPreset('weak')}
        >
          ⚠ Load Weak Prospect (Class 0)
        </button>
        <button
          type="button"
          className="presetBtn avg"
          onClick={() => loadPreset('average')}
        >
          ● Load Average Profile
        </button>
      </div>

      <form onSubmit={submit} className="formCard">
        <div className="grid">
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={update}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </label>

          <label>
            Campaign Channel
            <select name="campaign_channel" value={form.campaign_channel} onChange={update}>
              {['Email', 'PPC', 'Referral', 'SEO', 'Social Media'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Campaign Type
            <select name="campaign_type" value={form.campaign_type} onChange={update}>
              {['Awareness', 'Consideration', 'Conversion', 'Retention'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          {FIELD_META.map(({ name, label, type, min, max, step, hint }) => (
            <label key={name} className={errorField === name ? 'inputError' : ''}>
              <div className="labelRow">
                <span>{label}</span>
                {hint && <small className="fieldHint">{hint}</small>}
              </div>
              <input
                required
                step={step}
                type={type}
                name={name}
                min={min}
                max={max}
                value={form[name]}
                onChange={update}
                placeholder={hint}
              />
            </label>
          ))}
        </div>

        <div className="formActions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Running Model Inference…' : 'Predict Conversion Intent'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm(initial);
              setResult(null);
              setError('');
              setErrorField(null);
            }}
          >
            Clear Fields
          </button>
        </div>
      </form>

      {error && (
        <div className="notice error">
          <strong>⚠️ {error}</strong>
        </div>
      )}

      {result && (
        <div className={`resultCard ${result.prediction ? 'yes' : 'no'}`}>
          <div className="resultIcon">
            {result.prediction ? '✓' : '✕'}
          </div>
          <div className="resultText">
            <span className="resultTag">
              {result.prediction ? 'HIGH PROPENSITY PROSPECT' : 'LOW PROPENSITY PROSPECT'}
            </span>
            <h3>{result.label}</h3>
            <small>
              {result.prediction
                ? 'High propensity to convert based on behavioral, demographic, and campaign signals. Recommended for targeted conversion outreach.'
                : 'Low propensity to convert based on current engagement signals. Recommended for awareness nurturing or budget conservation.'}
            </small>
          </div>
        </div>
      )}
    </section>
  );
}
