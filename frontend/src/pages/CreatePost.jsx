import { useState } from 'react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DAY_MAP = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
};

const MAP_EMBEDS = {
  'Structure 2': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1261.5671237051129!2d-118.44065590486038!3d34.06854862436538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc878affdd69%3A0x6cc7e5e24a597905!2sParking%20Structure%202%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1779506355651!5m2!1sen!2sus',
  'Structure 3': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.7003269151987!2d-118.44259692439267!3d34.07719551641251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8a795600dd%3A0xec697e3a80ce9b83!2sParking%20Structure%203%2C%20215%20Charles%20E%20Young%20Dr%20N%2C%20Los%20Angeles%2C%20CA%2090024!5e0!3m2!1sen!2sus!4v1779506410229!5m2!1sen!2sus',
  'Structure 4': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6609.759639444802!2d-118.44734882439309!3d34.07259491665573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc894adea999%3A0x1796b84964298e5a!2sParking%20Structure%204%2C%20221%20Westwood%20Plaza%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506428833!5m2!1sen!2sus',
  'Structure 7': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6609.718340243569!2d-118.44947662439291!3d34.07312421662764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8ea39d0597%3A0xadcc3bdd65bc9d13!2sParking%20Structure%207%20-%20Underground%2C%20Charles%20E%20Young%20Dr%20N%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506452915!5m2!1sen!2sus',
  'Structure 8': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0667768651488!2d-118.44916452439324!3d34.06780241690882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc85f1f41865%3A0xbf48e42d9c4d478!2sStructure%208%20Driveway%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506482198!5m2!1sen!2sus',
  'Structure 9': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0838115391575!2d-118.44635812439326!3d34.06736571693179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8643c172a7%3A0x2b63fca22e7d1b95!2sStructure%209%20Parking%20Entry%2FExit%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1779506521848!5m2!1sen!2sus',
  'Structure 11': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1204.0229172551055!2d-118.45368835434132!3d34.074577649529516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc92fb8042e7%3A0x51992d08a739455b!2sParking%20Lot%2011%2C%20De%20Neve%20Dr%2C%20Los%20Angeles%2C%20CA%2090024!5e0!3m2!1sen!2sus!4v1779506546113!5m2!1sen!2sus',
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
    <main className="create-post-page page-enter">
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

          {parkingStructure && MAP_EMBEDS[parkingStructure] && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '4px' }}>
              <iframe
                key={parkingStructure}
                src={MAP_EMBEDS[parkingStructure]}
                width="100%"
                height="260"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${parkingStructure}`}
              />
            </div>
          )}

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