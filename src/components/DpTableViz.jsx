import React from 'react';

const formatTimestamp = (timestamp) => {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleString('en-IN', {
    hour: 'numeric', minute: 'numeric', hour12: true
  });
};

export const DpTableViz = ({ dpTables }) => {
  if (!dpTables || Object.keys(dpTables).length === 0) return null;

  return (
    <div className="dp-table-container">
      <h3>Dynamic Programming Table Visualization (Per Resource)</h3>
      <p>The optimal solution is built independently for each resource and then combined.</p>
      {Object.entries(dpTables).map(([resource, tableData]) => (
        <div key={resource} className="resource-table">
          <h4>Resource: {resource}</h4>
          <table>
            <thead>
              <tr>
                <th>Step (i)</th>
                <th>Event Considered</th>
                <th>Max Weight</th>
                <th>Events in Optimal Schedule up to this Step</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => {
                // Find the event being considered at this step. It's the event at the current index
                // in the sorted list that the DP was based on. We find it by its end time.
                const consideredEvent = row.events.find(e => e.end === Math.max(...row.events.map(ev => ev.end)));
                
                return (
                  <tr key={index}>
                    <td>{index}</td>
                    <td>{consideredEvent?.name || 'N/A'}</td>
                    <td>{row.weight}</td>
                    <td>
                      {row.events
                        .map(e => `${e.name} (${formatTimestamp(e.start)})`)
                        .join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};