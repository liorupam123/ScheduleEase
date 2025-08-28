import React, { useState } from 'react';

export const EventInputForm = ({ events, onAddEvent }) => {
  const [name, setName] = useState('');
  const [resource, setResource] = useState('Room A');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [weight, setWeight] = useState(1);
  const [prerequisite, setPrerequisite] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Please select valid start and end dates/times.');
      return;
    }
    if (endDate <= startDate) {
      alert('End time must be after start time.');
      return;
    }

    const newEvent = { 
      id: Date.now(), 
      name, 
      resource, 
      start: startDate,
      end: endDate,
      weight: +weight, 
    };

    if (prerequisite) {
      newEvent.prerequisite = +prerequisite;
    }

    onAddEvent(newEvent);
    // Reset form
    setName('');
    setStartDateTime('');
    setEndDateTime('');
    setWeight(1);
    setResource('Room A');
    setPrerequisite('');
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h3>Add New Event</h3>
      
      <label htmlFor="eventName">Event Name:</label>
      <input id="eventName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      
      <label htmlFor="eventResource">Resource:</label>
      <input id="eventResource" type="text" value={resource} onChange={(e) => setResource(e.target.value)} required />
      
      <label htmlFor="eventStart">Start Time:</label>
      <input id="eventStart" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />
      
      <label htmlFor="eventEnd">End Time:</label>
      <input id="eventEnd" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />
      
      <label htmlFor="eventWeight">Importance (Weight):</label>
      <input id="eventWeight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" required />

      <label htmlFor="prerequisite">Prerequisite (Optional):</label>
      <select id="prerequisite" value={prerequisite} onChange={(e) => setPrerequisite(e.target.value)}>
        <option value="">None</option>
        {events.map(event => (
          <option key={event.id} value={event.id}>{event.name} (in {event.resource})</option>
        ))}
      </select>
      
      <button type="submit">Add Event</button>
    </form>
  );
};