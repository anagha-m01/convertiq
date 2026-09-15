import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DemographicsSection({ genderData, ageData }) {
  if (!genderData || genderData.length === 0) return null;

  const genderChartData = genderData.map((g) => ({
    name: g.gender,
    Converted: g.converted,
    'Not Converted': g.not_converted,
    'Conversion Rate %': +(g.conversion_rate * 100).toFixed(1),
    'Avg Income ($)': g.avg_income,
    'Avg Spend ($)': g.avg_ad_spend
  }));

  const ageChartData = (ageData || []).map((a) => ({
    group: a.group,
    records: a.records,
    'Conversion Rate %': +(a.conversion_rate * 100).toFixed(1)
  }));

  return (
    <div className="analyticsSection">
      <div className="sectionSubheader">
        <div>
          <span className="badge">DEMOGRAPHIC BREAKDOWN</span>
          <h3>Gender & Age Distribution Analysis</h3>
          <p>Examine customer distribution and conversion parity across demographic cohorts.</p>
        </div>
      </div>

      <div className="demographicsGrid">
        {/* Gender KPI Cards */}
        {genderData.map((g) => (
          <div key={g.gender} className="demographicCard">
            <div className="demoCardTop">
              <div className="demoTitle">
                <span className={`genderIcon ${g.gender.toLowerCase()}`}>
                  {g.gender === 'Female' ? '♀' : '♂'}
                </span>
                <strong>{g.gender} Cohort</strong>
              </div>
              <span className="demoPct">{g.percentage}% of total</span>
            </div>

            <div className="demoStats">
              <div className="demoStatItem">
                <small>Total Count</small>
                <span>{g.total.toLocaleString()}</span>
              </div>
              <div className="demoStatItem">
                <small>Conversion Rate</small>
                <strong className="rateText">{(g.conversion_rate * 100).toFixed(1)}%</strong>
              </div>
              <div className="demoStatItem">
                <small>Avg Income</small>
                <span>${g.avg_income.toLocaleString()}</span>
              </div>
              <div className="demoStatItem">
                <small>Avg Ad Spend</small>
                <span>${g.avg_ad_spend.toLocaleString()}</span>
              </div>
            </div>

            {/* Mini visual ratio bar */}
            <div className="ratioBarContainer">
              <div
                className="ratioBar converted"
                style={{ width: `${(g.conversion_rate * 100).toFixed(1)}%` }}
                title={`Converted: ${g.converted.toLocaleString()}`}
              ></div>
              <div
                className="ratioBar notConverted"
                style={{ width: `${(100 - g.conversion_rate * 100).toFixed(1)}%` }}
                title={`Not Converted: ${g.not_converted.toLocaleString()}`}
              ></div>
            </div>
            <div className="ratioBarLegend">
              <span>● Converted ({g.converted.toLocaleString()})</span>
              <span>○ Not Converted ({g.not_converted.toLocaleString()})</span>
            </div>
          </div>
        ))}

        {/* Gender Distribution Stacked Bar */}
        <div className="chartCard">
          <div className="cardHeaderSm">
            <h4>Gender Volume by Conversion</h4>
            <span className="infoPill">Parity: 87.6% ♀ vs 87.7% ♂</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={genderChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Converted" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="Not Converted" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Groups Chart */}
        <div className="chartCard">
          <div className="cardHeaderSm">
            <h4>Age Cohorts Conversion Rate</h4>
            <span className="infoPill">Consistent across cohorts</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="group" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="Conversion Rate %" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insightBanner">
        <strong>EDA Takeaway on Demographics:</strong> The dataset comprises 60.5% Female and 39.5% Male users. Conversion rate is nearly identical between genders (87.62% vs 87.69%), confirming that campaign efficacy is non-discriminatory across gender lines and models should not penalize gender.
      </div>
    </div>
  );
}
