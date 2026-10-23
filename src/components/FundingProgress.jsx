import React from 'react';

export default function FundingProgress() {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const collectedLength = circumference * (3 / 20);

  return (
    <section className="funding-section" aria-labelledby="funding-title">
      <div className="funding-copy">
        <p className="context-line">Treatment funding</p>
        <h2 id="funding-title">₹3 lakh collected</h2>
        <p>₹17 lakh remains to reach the ₹20 lakh treatment target. The collected amount is 15% of the target.</p>
      </div>
      <div className="funding-visual">
        <svg className="funding-chart" viewBox="0 0 160 160" role="img" aria-labelledby="chart-title chart-description">
          <title id="chart-title">Collected amount compared with treatment target</title>
          <desc id="chart-description">₹3 lakh collected, 15% of the ₹20 lakh treatment target, with ₹17 lakh remaining.</desc>
          <circle className="chart-track" cx="80" cy="80" r={radius} />
          <circle className="chart-target" cx="80" cy="80" r={radius} strokeDasharray={`${collectedLength} ${circumference - collectedLength}`} />
          <text className="chart-center-value" x="80" y="76" textAnchor="middle">15%</text>
          <text className="chart-center-label" x="80" y="96" textAnchor="middle">of target</text>
        </svg>
        <div className="funding-legend" aria-label="Funding amounts">
          <p><span className="legend-swatch target-swatch" />Collected <strong>₹3 lakh</strong></p>
          <p><span className="legend-swatch extra-swatch" />Remaining <strong>₹17 lakh</strong></p>
          <p className="legend-total">Treatment target <strong>₹20 lakh</strong></p>
        </div>
      </div>
    </section>
  );
}
