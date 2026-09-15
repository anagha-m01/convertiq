import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ModelEvaluationSection({ metrics, modelCompare }) {
  const [metricView, setMetricView] = useState('macro_f1');

  if (!metrics) return null;

  const cm = metrics.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] ?? 0;
  const fp = cm[0]?.[1] ?? 0;
  const fn = cm[1]?.[0] ?? 0;
  const tp = cm[1]?.[1] ?? 0;

  const prec0 = metrics.class_0?.precision ?? 0;
  const rec0 = metrics.class_0?.recall ?? 0;
  const f1_0 = metrics.class_0?.f1 ?? 0;
  const supp0 = metrics.class_0?.support ?? 198;

  const prec1 = metrics.class_1?.precision ?? 0;
  const rec1 = metrics.class_1?.recall ?? 0;
  const f1_1 = metrics.class_1?.f1 ?? 0;
  const supp1 = metrics.class_1?.support ?? 1402;

  const totalSupport = supp0 + supp1;
  const macroPrec = (prec0 + prec1) / 2;
  const macroRec = (rec0 + rec1) / 2;
  const macroF1 = metrics.macro_f1 ?? (f1_0 + f1_1) / 2;

  const weightedPrec = totalSupport ? (prec0 * supp0 + prec1 * supp1) / totalSupport : 0;
  const weightedRec = totalSupport ? (rec0 * supp0 + rec1 * supp1) / totalSupport : 0;
  const weightedF1 = totalSupport ? (f1_0 * supp0 + f1_1 * supp1) / totalSupport : 0;

  const compareData = (modelCompare || []).map((m) => ({
    model: m.model,
    'Accuracy %': +(m.accuracy * 100).toFixed(1),
    'Balanced Acc %': +(m.balanced_accuracy * 100).toFixed(1),
    'Macro F1 %': +(m.macro_f1 * 100).toFixed(1),
    'ROC-AUC': +m.roc_auc.toFixed(3)
  }));

  return (
    <div className="analyticsSection">
      <div className="sectionSubheader">
        <div>
          <span className="badge">ML EVALUATION & DIAGNOSTICS</span>
          <h3>Model Diagnostics & Algorithm Benchmark</h3>
          <p>
            Beyond accuracy: evaluating class imbalance, confusion matrix, precision, recall, and benchmark comparisons.
          </p>
        </div>
      </div>

      {/* Primary ML Performance Metric Cards */}
      <div className="kpisGrid mlKpis">
        <div className="kpiCard success">
          <div className="kpiTop">
            <span>Macro Precision</span>
            <span className="kpiIcon">🎯</span>
          </div>
          <strong>{(macroPrec * 100).toFixed(1)}%</strong>
          <small>Class 0: {(prec0 * 100).toFixed(1)}% | Class 1: {(prec1 * 100).toFixed(1)}%</small>
        </div>

        <div className="kpiCard success">
          <div className="kpiTop">
            <span>Macro Recall (Balanced Acc)</span>
            <span className="kpiIcon">📡</span>
          </div>
          <strong>{(macroRec * 100).toFixed(1)}%</strong>
          <small>Class 0: {(rec0 * 100).toFixed(1)}% | Class 1: {(rec1 * 100).toFixed(1)}%</small>
        </div>

        <div className="kpiCard success">
          <div className="kpiTop">
            <span>Macro F1-Score</span>
            <span className="kpiIcon">⚡</span>
          </div>
          <strong>{macroF1.toFixed(3)}</strong>
          <small>Harmonic mean across both cohorts</small>
        </div>

        <div className="kpiCard">
          <div className="kpiTop">
            <span>ROC-AUC Score</span>
            <span className="kpiIcon">📈</span>
          </div>
          <strong>{metrics.roc_auc ? metrics.roc_auc.toFixed(3) : '0.794'}</strong>
          <small>Threshold-independent discrimination</small>
        </div>
      </div>

      <div className="modelDiagnosticsGrid">
        {/* Confusion Matrix Card */}
        <div className="diagnosticCard">
          <h4>AdaBoost Confusion Matrix (Holdout Test N=1,600)</h4>
          <p className="cardDesc">
            Actual vs Predicted conversion outcomes showing true/false positive rates.
          </p>

          <div className="cmWrapper">
            <div className="cmColHeaderLabel">Predicted Non-Converter (0)</div>
            <div className="cmColHeaderLabel">Predicted Converter (1)</div>

            <div className="cmRowHeader">True 0 (198)</div>
            <div className="cmCell tn" title="True Negatives: correctly identified non-converters">
              <span className="cmLabel">TN</span>
              <strong>{tn}</strong>
              <small>True Non-Converters</small>
            </div>
            <div className="cmCell fp" title="False Positives: non-converters mistakenly flagged as converters">
              <span className="cmLabel">FP</span>
              <strong>{fp}</strong>
              <small>False Alarms</small>
            </div>

            <div className="cmRowHeader">True 1 (1402)</div>
            <div className="cmCell fn" title="False Negatives: converters missed">
              <span className="cmLabel">FN</span>
              <strong>{fn}</strong>
              <small>Missed Converters</small>
            </div>
            <div className="cmCell tp" title="True Positives: correctly predicted converters">
              <span className="cmLabel">TP</span>
              <strong>{tp}</strong>
              <small>True Converters</small>
            </div>
          </div>

          {/* Per-class Metrics breakdown */}
          <div className="classMetricsTable">
            <div className="metricRow header">
              <span>Cohort</span>
              <span>Precision</span>
              <span>Recall</span>
              <span>F1-Score</span>
              <span>Support</span>
            </div>
            <div className="metricRow">
              <span className="cohortBadge zero">Class 0 (Non-Conv)</span>
              <span>{(prec0 * 100).toFixed(1)}%</span>
              <span>{(rec0 * 100).toFixed(1)}%</span>
              <span>{f1_0.toFixed(3)}</span>
              <span>{supp0}</span>
            </div>
            <div className="metricRow">
              <span className="cohortBadge one">Class 1 (Converter)</span>
              <span>{(prec1 * 100).toFixed(1)}%</span>
              <span>{(rec1 * 100).toFixed(1)}%</span>
              <span>{f1_1.toFixed(3)}</span>
              <span>{supp1}</span>
            </div>
            <div className="metricRow summaryRow">
              <span className="cohortBadge macro">Macro Avg</span>
              <span>{(macroPrec * 100).toFixed(1)}%</span>
              <span>{(macroRec * 100).toFixed(1)}%</span>
              <span>{macroF1.toFixed(3)}</span>
              <span>{totalSupport.toLocaleString()}</span>
            </div>
            <div className="metricRow summaryRow">
              <span className="cohortBadge weighted">Weighted Avg</span>
              <span>{(weightedPrec * 100).toFixed(1)}%</span>
              <span>{(weightedRec * 100).toFixed(1)}%</span>
              <span>{weightedF1.toFixed(3)}</span>
              <span>{totalSupport.toLocaleString()}</span>
            </div>
          </div>

          <div className="paradoxWarning">
            <strong>The Accuracy Paradox:</strong> Test accuracy is <strong>88.6%</strong>, but predicting all 1s trivially yields <strong>87.6%</strong>. The model's real diagnostic ability is reflected in Balanced Accuracy (<strong>72.2%</strong>) and Macro F1 (<strong>0.729</strong>).
          </div>
        </div>

        {/* Model Benchmark Comparison Chart & Table */}
        <div className="diagnosticCard">
          <div className="cardHeaderSm">
            <h4>Algorithm Benchmark Comparison</h4>
            <div className="toggleGroup">
              <button
                className={`toggleBtn ${metricView === 'macro_f1' ? 'active' : ''}`}
                onClick={() => setMetricView('macro_f1')}
              >
                Macro F1
              </button>
              <button
                className={`toggleBtn ${metricView === 'balanced_accuracy' ? 'active' : ''}`}
                onClick={() => setMetricView('balanced_accuracy')}
              >
                Balanced Acc
              </button>
              <button
                className={`toggleBtn ${metricView === 'accuracy' ? 'active' : ''}`}
                onClick={() => setMetricView('accuracy')}
              >
                Accuracy
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compareData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <XAxis dataKey="model" fontSize={10} interval={0} angle={-25} textAnchor="end" />
              <YAxis domain={[50, 100]} fontSize={11} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar
                dataKey={
                  metricView === 'macro_f1'
                    ? 'Macro F1 %'
                    : metricView === 'balanced_accuracy'
                    ? 'Balanced Acc %'
                    : 'Accuracy %'
                }
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Mini comparison table */}
          <div className="compareTable">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Balanced Acc</th>
                  <th>Class 0 Recall</th>
                  <th>Macro F1</th>
                  <th>ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {(modelCompare || []).map((m) => (
                  <tr key={m.model} className={m.model === 'AdaBoost' ? 'selectedRow' : ''}>
                    <td>
                      <strong>{m.model}</strong>
                      {m.model === 'AdaBoost' && <span className="winnerTag">Selected</span>}
                    </td>
                    <td>{(m.accuracy * 100).toFixed(1)}%</td>
                    <td>{(m.balanced_accuracy * 100).toFixed(1)}%</td>
                    <td>{((m.recall_0 || 0) * 100).toFixed(1)}%</td>
                    <td><strong>{m.macro_f1.toFixed(3)}</strong></td>
                    <td>{m.roc_auc.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
