import React from 'react';
import { rupees } from '../data/appeal.js';
import { useAppeal } from '../data/liveAppeal.jsx';

export default function FundingProgress() {
  const { appeal } = useAppeal();
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const { target, collected } = appeal.funding;
  const remaining = Math.max(0, target - collected);
  const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;
  const collectedLength = circumference * (target > 0 ? Math.min(1, collected / target) : 0);

  return (
    <section className="funding-section" aria-labelledby="funding-title">
      <div className="funding-copy">
        <p className="context-line">Treatment funding</p>
        <h2 id="funding-title">{rupees(collected)} collected</h2>
        <p>{rupees(remaining)} remains to reach the {rupees(target)} treatment target. The collected amount is about {percent}% of the target.</p>
      </div>
      <div className="funding-visual">
        <svg className="funding-chart" viewBox="0 0 160 160" role="img" aria-labelledby="chart-title chart-description">
          <title id="chart-title">Collected amount compared with treatment target</title>
          <desc id="chart-description">{`${rupees(collected)} collected, about ${percent}% of the ${rupees(target)} treatment target, with ${rupees(remaining)} remaining.`}</desc>
          <circle className="chart-track" cx="80" cy="80" r={radius} />
          <circle className="chart-target" cx="80" cy="80" r={radius} strokeDasharray={`${collectedLength} ${circumference - collectedLength}`} />
          <text className="chart-center-value" x="80" y="76" textAnchor="middle">{percent}%</text>
          <text className="chart-center-label" x="80" y="96" textAnchor="middle">of target</text>
        </svg>
        <div className="funding-legend" aria-label="Funding amounts">
          <p><span className="legend-swatch target-swatch" />Collected <strong>{rupees(collected)}</strong></p>
          <p><span className="legend-swatch extra-swatch" />Remaining <strong>{rupees(remaining)}</strong></p>
          <p className="legend-total">Treatment target <strong>{rupees(target)}</strong></p>
        </div>
      </div>
    </section>
  );
}
