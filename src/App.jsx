import React, { useState } from 'react';
import { computeSchedules } from './algorithms/scheduler';
import { EventInputForm } from './components/EventInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';

// Helper to format Date objects for display
const formatDateTime = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true
  });
};

const App = () => {
  const [events, setEvents] = useState([
    { id: 1, name: 'API Design', start: new Date('2025-10-27T09:30:00'), end: new Date('2025-10-27T11:30:00'), weight: 5, resource: 'Room B' },
    { id: 2, name: 'Client Call', start: new Date('2025-10-27T10:00:00'), end: new Date('2025-10-27T12:00:00'), weight: 8, resource: 'Room A' },
    { id: 3, name: 'Code Review', start: new Date('2025-10-27T12:00:00'), end: new Date('2025-10-27T13:00:00'), weight: 4, resource: 'Room A', prerequisite: 2 },
  ]);
  const [results, setResults] = useState(null);

  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleCompute = () => {
    // Convert Date objects in events to numerical timestamps for the algorithm
    const eventsForAlgorithm = events.map(event => ({
      ...event,
      start: event.start.getTime(),
      end: event.end.getTime(),
    }));
    const computedResults = computeSchedules(eventsForAlgorithm);
    setResults(computedResults);
  };
  
  const handleRemoveEvent = (id) => {
    // Also remove any dependencies pointing to this event
    const newEvents = events
      .filter(event => event.id !== id)
      .map(event => event.prerequisite === id ? { ...event, prerequisite: undefined } : event);
    setEvents(newEvents);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Advanced Scheduling Optimizer</h1>
        <p>Comparing DP, Memoization, and Greedy algorithms with Dependency Graph support.</p>
      </header>
      <div className="main-content">
        <div className="left-panel">
          <EventInputForm events={events} onAddEvent={handleAddEvent} />
          <div className="event-list">
            <h3>Current Events</h3>
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  <span>
                    {event.name} (<strong>{event.resource}</strong> | W:{event.weight})
                    {event.prerequisite && <small style={{display: 'block'}}>Depends on: {events.find(e => e.id === event.prerequisite)?.name || 'Unknown'}</small>}
                  </span>
                  <button onClick={() => handleRemoveEvent(event.id)} className="remove-btn">x</button>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleCompute} className="compute-btn">
            Compute Schedules
          </button>
        </div>
        <div className="right-panel">
          {results ? <ResultsDisplay results={results} /> : <p className="placeholder">Add events and click "Compute" to see the results.</p>}
        </div>
      </div>
    </div>
  );
};

export default App;