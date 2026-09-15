import React, { useState } from 'react';

// Color interpolation for correlation (-1 to +1)
function getHeatmapColor(val) {
  if (val === undefined || val === null || isNaN(val)) return '#f8fafc';
  // Val is from -1.0 to 1.0
  if (val >= 0) {
    // 0 -> #f8fafc, 1 -> #4338ca (rich indigo)
    const intensity = Math.min(1, Math.max(0, val));
    if (intensity < 0.05) return '#ffffff';
    if (intensity < 0.2) return `rgba(99, 102, 241, ${0.15 + intensity * 0.4})`;
    if (intensity < 0.5) return `rgba(79, 70, 229, ${0.35 + intensity * 0.5})`;
    return `rgba(67, 56, 202, ${0.6 + intensity * 0.4})`;
  } else {
    // Negative: 0 -> #f8fafc, -1 -> #0284c7 (cyan/blue)
    const intensity = Math.min(1, Math.max(0, Math.abs(val)));
    return `rgba(2, 132, 199, ${0.2 + intensity * 0.7})`;
  }
}

function getTextColor(val) {
  if (Math.abs(val) > 0.45) return '#ffffff';
  return '#1e293b';
}

const SHORT_NAMES = {
  AdSpend: 'Spend',
  ClickThroughRate: 'CTR',
  WebsiteVisits: 'Visits',
  PagesPerVisit: 'Pages/Vis',
  TimeOnSite: 'TimeOnSite',
  SocialShares: 'Shares',
  EmailOpens: 'EmailOpen',
  EmailClicks: 'EmailClick',
  PreviousPurchases: 'PrevPurch',
  LoyaltyPoints: 'Loyalty',
  Conversion: 'Conversion'
};

export default function CorrelationHeatmap({ correlation }) {
  const [hovered, setHovered] = useState(null);

  if (!correlation || !correlation.features || !correlation.matrix) {
    return <div className="notice">Loading correlation matrix…</div>;
  }

  const { features, matrix } = correlation;

  return (
    <div className="analyticsCard heatmapContainer">
      <div className="cardHeader">
        <div>
          <span className="badge">EXPLORATORY DATA ANALYSIS</span>
          <h3>Feature Correlation Heatmap</h3>
          <p>
            Pearson correlation coefficients ($r$) across all 11 numerical features from the dataset.
          </p>
        </div>
        <div className="heatmapLegend">
          <span className="legendItem"><span className="legendBox neg"></span> Negative</span>
          <span className="legendItem"><span className="legendBox neutral"></span> 0.00 Neutral</span>
          <span className="legendItem"><span className="legendBox pos"></span> Positive</span>
        </div>
      </div>

      <div className="heatmapScrollWrapper">
        <div
          className="heatmapGrid"
          style={{
            gridTemplateColumns: `110px repeat(${features.length}, minmax(46px, 1fr))`
          }}
        >
          {/* Top-left corner */}
          <div className="heatmapHeaderCell corner"></div>

          {/* Column headers */}
          {features.map((colName) => (
            <div key={`col-${colName}`} className="heatmapHeaderCell colHeader" title={colName}>
              <span>{SHORT_NAMES[colName] || colName}</span>
            </div>
          ))}

          {/* Matrix rows */}
          {features.map((rowName, rowIdx) => (
            <React.Fragment key={`row-${rowName}`}>
              {/* Row header */}
              <div className="heatmapHeaderCell rowHeader" title={rowName}>
                {SHORT_NAMES[rowName] || rowName}
              </div>

              {/* Cells */}
              {features.map((colName, colIdx) => {
                const val = matrix[rowIdx]?.[colIdx] ?? 0;
                const isHovered = hovered?.x === colName && hovered?.y === rowName;
                const isRelated = hovered?.x === colName || hovered?.y === rowName;

                return (
                  <div
                    key={`cell-${rowName}-${colName}`}
                    className={`heatmapCell ${isHovered ? 'active' : ''} ${isRelated ? 'highlight' : ''}`}
                    style={{
                      backgroundColor: getHeatmapColor(val),
                      color: getTextColor(val)
                    }}
                    onMouseEnter={() => setHovered({ x: colName, y: rowName, val })}
                    onMouseLeave={() => setHovered(null)}
                    title={`${rowName} × ${colName}: ${val}`}
                  >
                    <span className="cellVal">{val.toFixed(2)}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {hovered ? (
        <div className="heatmapTooltipBar">
          <strong>{hovered.y}</strong> &harr; <strong>{hovered.x}</strong>:{' '}
          <span className={`corrVal ${hovered.val > 0 ? 'pos' : hovered.val < 0 ? 'neg' : ''}`}>
            r = {hovered.val.toFixed(2)}
          </span>
          <span className="tooltipHint">
            {hovered.x === hovered.y
              ? ' (Perfect self-correlation)'
              : hovered.val === 0
              ? ' (No linear correlation)'
              : hovered.val > 0.1
              ? ' (Positive linear relationship)'
              : hovered.val < -0.1
              ? ' (Negative linear relationship)'
              : ' (Weak / negligible correlation)'}
          </span>
        </div>
      ) : (
        <div className="heatmapInsight">
          <strong>Key Correlation Finding:</strong> Target <code>Conversion</code> exhibits positive correlation with engagement features (e.g. <code>TimeOnSite</code> $r=+0.21$, <code>EmailClicks</code> $r=+0.17$, <code>AdSpend</code> $r=+0.16$), while channel engagement features are largely orthogonal, minimizing multi-collinearity.
        </div>
      )}
    </div>
  );
}
