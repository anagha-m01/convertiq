import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import DemographicsSection from '../components/DemographicsSection';
import AdSpendSection from '../components/AdSpendSection';
import ModelEvaluationSection from '../components/ModelEvaluationSection';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [modelCompare, setModelCompare] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics/full'),
      api.get('/api/model/metrics'),
      api.get('/api/model/compare')
    ])
      .then(([analyticsRes, metricsRes, compareRes]) => {
        setData(analyticsRes.data);
        setMetrics(metricsRes.data);
        setModelCompare(compareRes.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        setError('Could not load analytics. Make sure the FastAPI backend is running on port 8000.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loadingState">
        <div className="spinner"></div>
        <p>Loading analytics and data science artifacts…</p>
      </div>
    );
  }

  if (error) {
    return <div className="notice error">{error}</div>;
  }

  const { overview, channels, campaigns, correlation, gender_distribution, age_group_stats, ad_spend_by_conversion, spend_tier_stats } = data || {};

  return (
    <section className="dashboardWrapper">
      {/* Hero Header */}
      <div className="heroSection">
        <div className="heroContent">
          <span className="eyebrow">MARKETING DATA SCIENCE PLATFORM</span>
          <h2>Campaign Analytics & Model Diagnostics</h2>
          <p>
            Exploratory data analysis, feature correlations, demographic distributions, and ML benchmark diagnostics derived directly from the marketing dataset.
          </p>
        </div>

        {/* Dataset Metadata Badges */}
        <div className="metaBadges">
          <span className="metaBadge">📊 <strong>8,000</strong> Records</span>
          <span className="metaBadge">🏷️ <strong>15</strong> Features</span>
          <span className="metaBadge">⚖️ <strong>7.1 : 1</strong> Class Imbalance</span>
          <span className="metaBadge">⚡ <strong>AdaBoost + SMOTE</strong> Pipeline</span>
        </div>
      </div>

      {/* Subnav Filter Tabs */}
      <div className="subnavTabs">
        {[
          { id: 'all', label: 'All Analytics' },
          { id: 'correlation', label: 'Feature Correlation' },
          { id: 'demographics', label: 'Gender & Demographics' },
          { id: 'spend', label: 'Ad Spend & Channels' },
          { id: 'model', label: 'ML Benchmark & Matrix' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`subnavBtn ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview KPIs */}
      {(activeFilter === 'all' || activeFilter === 'demographics' || activeFilter === 'spend') && (
        <div className="kpisGrid">
          <KpiCard
            label="Total Customers"
            value={overview?.total_customers?.toLocaleString()}
            sub="Complete dataset sample"
            icon="👥"
          />
          <KpiCard
            label="Converted Customers"
            value={overview?.converted?.toLocaleString()}
            sub={`${((overview?.converted / overview?.total_customers) * 100).toFixed(1)}% conversion rate`}
            icon="🎯"
            variant="success"
          />
          <KpiCard
            label="Non-Converters (Class 0)"
            value={overview?.not_converted?.toLocaleString()}
            sub={`${((overview?.not_converted / overview?.total_customers) * 100).toFixed(1)}% minority class`}
            icon="⚠️"
            variant="warning"
          />
          <KpiCard
            label="Avg. Ad Spend"
            value={`$${overview?.avg_ad_spend?.toFixed(0)}`}
            sub={`Avg Income: $${overview?.avg_income?.toFixed(0)}`}
            icon="💰"
          />
        </div>
      )}

      {/* 1. Feature Correlation Heatmap */}
      {(activeFilter === 'all' || activeFilter === 'correlation') && (
        <div className="sectionBlock">
          <CorrelationHeatmap correlation={correlation} />
        </div>
      )}

      {/* 2. Demographic & Gender Distribution */}
      {(activeFilter === 'all' || activeFilter === 'demographics') && (
        <div className="sectionBlock">
          <DemographicsSection genderData={gender_distribution} ageData={age_group_stats} />
        </div>
      )}

      {/* 3. Ad Spend & Marketing Channels */}
      {(activeFilter === 'all' || activeFilter === 'spend') && (
        <div className="sectionBlock">
          <AdSpendSection
            spendData={{
              by_conversion: ad_spend_by_conversion,
              by_tier: spend_tier_stats
            }}
          />

          {/* Channel & Campaign Performance Charts */}
          <div className="channelsGrid">
            <ChartCard title="Conversion Rate by Channel" data={channels} metric="conversion_rate" format="%" color="#2563eb" />
            <ChartCard title="Conversion Rate by Campaign Type" data={campaigns} metric="conversion_rate" format="%" color="#7c3aed" />
          </div>
        </div>
      )}

      {/* 4. Model Evaluation & Benchmark Diagnostics */}
      {(activeFilter === 'all' || activeFilter === 'model') && (
        <div className="sectionBlock">
          <ModelEvaluationSection metrics={metrics} modelCompare={modelCompare} />
        </div>
      )}
    </section>
  );
}

function KpiCard({ label, value, sub, icon, variant }) {
  return (
    <div className={`kpiCard ${variant || ''}`}>
      <div className="kpiTop">
        <span>{label}</span>
        {icon && <span className="kpiIcon">{icon}</span>}
      </div>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function ChartCard({ title, data, metric, format, color }) {
  if (!data) return null;
  const rows = data.map((x) => ({
    ...x,
    val: +(x[metric] * 100).toFixed(1)
  }));

  return (
    <div className="chartCard">
      <div className="cardHeaderSm">
        <h4>{title}</h4>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
          <XAxis dataKey="name" fontSize={11} />
          <YAxis domain={[70, 100]} fontSize={11} unit={format} />
          <Tooltip formatter={(v) => `${v}${format}`} />
          <Bar dataKey="val" fill={color || '#1f5eff'} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
