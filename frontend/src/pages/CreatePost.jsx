import { useState } from 'react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DAY_MAP = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
};

function CreatePost() {
  const [parkingStructure, setParkingStructure] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState('');

  function toggleDay(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addScheduleItem() {
    if (selectedDays.length === 0 || !startTime || !endTime) {
      return;
    }

    const newItems = selectedDays.map((shortDay) => ({
      day: DAY_MAP[shortDay],
      startTime,
      endTime,
    }));

    setSchedule((prev) => [...prev, ...newItems]);
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
  }

  async function submitPost(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parkingStructure, schedule, notes }),
    });

    if (response.ok) {
      setMessage('Parking post created successfully!');
      setParkingStructure('');
      setNotes('');
      setSchedule([]);
    } else {
      const data = await response.json();
      setMessage(data.error || 'Failed to create parking post.');
    }
  }

  return (
    <main className="create-post-page">
      <div className="create-post-card">
        <h1>Create Parking Post</h1>

        <p>
          Tell BruinPark when you usually need parking so other commuters can
          find compatible schedules.
        </p>

        <form className="create-post-form" onSubmit={submitPost}>
          <label>
            Parking Structure
            <select
              value={parkingStructure}
              onChange={(e) => setParkingStructure(e.target.value)}
            >
              <option value="">Select a structure</option>
              <option value="Structure 2">Structure 2</option>
              <option value="Structure 3">Structure 3</option>
              <option value="Structure 4">Structure 4</option>
              <option value="Structure 7">Structure 7</option>
              <option value="Structure 8">Structure 8</option>
              <option value="Structure 9">Structure 9</option>
              <option value="Structure 11">Structure 11</option>
            </select>
          </label>

          <p>Selected: {parkingStructure || 'None Yet'}</p>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Example: I usually stay late on Monday for club meetings."
            />
          </label>

          <p>Notes Preview: {notes || 'No notes yet'}</p>

          <div className="schedule-section">
            <h2>Weekly Schedule</h2>
            <p>Select one or more days, set a time range, then click Add Time.</p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              {ALL_DAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13px',
                      background: active ? '#2774ae' : '#e2e8f0',
                      color: active ? 'white' : '#172033',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <label>
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label>
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="home-login-button"
              onClick={addScheduleItem}
              disabled={selectedDays.length === 0 || !startTime || !endTime}
            >
              Add Time
            </button>

            <div className="schedule-list">
              {schedule.length === 0 && <p>No schedule times added yet.</p>}
              {schedule.map((item, index) => (
                <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                  <strong style={{ textTransform: 'capitalize' }}>{item.day}</strong>: {item.startTime} – {item.endTime}
                </p>
              ))}
            </div>
          </div>

          <button className="home-login-button" type="submit">
            Create Post
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </main>
  );
}

export default CreatePost;