import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdSpendSection({ spendData }) {
  if (!spendData) return null;

  const { by_conversion, by_tier } = spendData;
  const nonConverted = by_conversion?.['0'] || {};
  const converted = by_conversion?.['1'] || {};

  const tierChartData = (by_tier || []).map((t) => ({
    tier: t.tier,
    'Conversion Rate %': +(t.conversion_rate * 100).toFixed(1),
    'Customers': t.records,
    'Avg Spend ($)': t.avg_ad_spend
  }));

  return (
    <div className="analyticsSection">
      <div className="sectionSubheader">
        <div>
          <span className="badge">FINANCIAL & CAMPAIGN DYNAMICS</span>
          <h3>Ad Spend Distribution & Conversion Dynamics</h3>
          <p>Evaluating budget allocation, spend thresholds, and diminishing returns on conversions.</p>
        </div>
      </div>

      <div className="adSpendGrid">
        {/* Boxplot / Statistical Distribution Comparison Card */}
        <div className="spendSummaryCard">
          <h4>Spend Quartiles: Converted vs Non-Converted</h4>
          <p className="cardDesc">
            Distribution parameters (Min, Q1, Median, Mean, Q3, Max) across conversion groups.
          </p>

          <div className="quartileComparison">
            {/* Non-converted (0) */}
            <div className="quartileCol notConv">
              <div className="groupTag">Not Converted (Class 0)</div>
              <div className="statRow"><span>Mean Spend</span><strong>${nonConverted.mean?.toLocaleString()}</strong></div>
              <div className="statRow"><span>Median (Q2)</span><strong>${nonConverted.median?.toLocaleString()}</strong></div>
              <div className="statRow"><span>IQR (Q1 – Q3)</span><span>${nonConverted.q1?.toLocaleString()} – ${nonConverted.q3?.toLocaleString()}</span></div>
              <div className="statRow"><span>Range</span><span>${nonConverted.min?.toLocaleString()} – ${nonConverted.max?.toLocaleString()}</span></div>
              <div className="statRow"><span>Std Deviation</span><span>${nonConverted.std?.toLocaleString()}</span></div>
            </div>

            {/* Converted (1) */}
            <div className="quartileCol conv">
              <div className="groupTag success">Converted (Class 1)</div>
              <div className="statRow"><span>Mean Spend</span><strong>${converted.mean?.toLocaleString()}</strong></div>
              <div className="statRow"><span>Median (Q2)</span><strong>${converted.median?.toLocaleString()}</strong></div>
              <div className="statRow"><span>IQR (Q1 – Q3)</span><span>${converted.q1?.toLocaleString()} – ${converted.q3?.toLocaleString()}</span></div>
              <div className="statRow"><span>Range</span><span>${converted.min?.toLocaleString()} – ${converted.max?.toLocaleString()}</span></div>
              <div className="statRow"><span>Std Deviation</span><span>${converted.std?.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="spendDiffCallout">
            <span>Spend Differential:</span> Converted prospects receive an average of <strong>+${((converted.mean || 0) - (nonConverted.mean || 0)).toFixed(0)}</strong> (+{(((converted.mean || 0) / (nonConverted.mean || 1) - 1) * 100).toFixed(1)}%) in ad spend.
          </div>
        </div>

        {/* Spend Tiers Chart */}
        <div className="chartCard">
          <div className="cardHeaderSm">
            <h4>Conversion Rate by Ad Spend Tier</h4>
            <span className="infoPill">Volume & Efficiency</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tierChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="tier" fontSize={11} />
              <YAxis domain={[75, 100]} fontSize={11} unit="%" />
              <Tooltip formatter={(v, name) => [name === 'Conversion Rate %' ? `${v}%` : v, name]} />
              <Bar dataKey="Conversion Rate %" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insightBanner">
        <strong>Notebook Analytical Insight:</strong> Users with higher ad spend generally exhibit higher conversion rates (median $5,103 vs $4,012). However, high-spending non-converters exist as outliers up to $10,000. This indicates budget increases yield diminishing returns without audience retargeting and intent qualification.
      </div>
    </div>
  );
}
