import React from 'react';
import { DpTableViz } from './DpTableViz';

const formatTimestamp = (timestamp) => {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true
  });
};

export const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  if (results.error) {
    return <div className="error-card"><h3>Error</h3><p>{results.error}</p></div>
  }

  const renderEventList = (events) => (
    <ul>
      {events.map(event => (
        <li key={event.id}>
          {event.name} (<strong>{event.resource}</strong> | {formatTimestamp(event.start)} - {formatTimestamp(event.end)} | W: {event.weight})
        </li>
      ))}
    </ul>
  );

  return (
    <div className="results-container">
      <h2>Algorithm Comparison</h2>
      <div className="schedules-side-by-side">
        <div className="schedule-card">
          <h3>✅ Bottom-Up DP (Optimal)</h3>
          <p><strong>Total Score:</strong> {results.dpBottomUp.totalWeight}</p>
          {renderEventList(results.dpBottomUp.events)}
        </div>
        <div className="schedule-card">
          <h3>✅ Top-Down DP (Optimal)</h3>
          <p><strong>Total Score:</strong> {results.dpTopDown.totalWeight}</p>
          {renderEventList(results.dpTopDown.events)}
        </div>
        <div className="schedule-card">
          <h3>⚡ Greedy (Sub-Optimal)</h3>
          <p><strong>Total Score:</strong> {results.greedy.totalWeight}</p>
          {/* THE FIX IS ON THE LINE BELOW */}
          {renderEventList(results.greedy.events)}
        </div>
      </div>
      <DpTableViz dpTables={results.dpTables} />
    </div>
  );
};