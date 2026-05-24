import { useState, useEffect } from 'react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DAY_MAP = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
};

function formatTime(time) {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

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
  const [verified, setVerified] = useState(null); // null = loading

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) { window.location.href = '/'; return; }
        setVerified(data.isVerified);
      })
      .catch(() => { window.location.href = '/'; });
  }, []);

  const [parkingStructure, setParkingStructure] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  function toggleDay(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addScheduleItem() {
    if (selectedDays.length === 0 || !startTime || !endTime) {
      return;
    }

    if (startTime >= endTime) {
      setScheduleError('Start time must be before end time.');
      return;
    }

    setScheduleError('');
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

  function removeScheduleItem(index) {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmitClick(event) {
    event.preventDefault();
    setMessage('');

    if (!parkingStructure) {
      setMessage('Please select a parking structure.');
      return;
    }
    if (schedule.length === 0) {
      setMessage('Please add at least one schedule time.');
      return;
    }

    setShowConfirm(true);
  }

  async function confirmSubmit() {
    setShowConfirm(false);

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

  if (verified === null) {
    return (
      <main className="create-post-page page-enter">
        <div className="create-post-card"><p>Loading...</p></div>
      </main>
    );
  }

  if (verified === false) {
    return (
      <main className="create-post-page page-enter">
        <div className="create-post-card">
          <h1>Permit Required</h1>
          <p>You must verify your UCLA parking permit before creating posts.</p>
          <a className="home-login-button" href="/verify">
            Go to Verification →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="create-post-page page-enter">
      <div className="create-post-card">
        <h1>Create Parking Post</h1>

        <p>
          Tell BruinPark when you usually need parking so other commuters can
          find compatible schedules.
        </p>

        <form className="create-post-form" onSubmit={handleSubmitClick}>
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

            {scheduleError && (
              <p style={{ color: '#ef4444', fontWeight: '700', margin: '8px 0 0' }}>
                {scheduleError}
              </p>
            )}

            <div className="schedule-list">
              {schedule.length === 0 && <p>No schedule times added yet.</p>}
              {schedule.map((item, index) => (
                <div
                  key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                    <strong>{item.day}</strong>: {formatTime(item.startTime)} – {formatTime(item.endTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeScheduleItem(index)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '12px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="home-login-button" type="submit">
            Create Post
          </button>

          {message && (
            <p style={{
              marginTop: '12px',
              fontWeight: '700',
              color: message.includes('successfully') ? '#16a34a' : '#ef4444',
            }}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '36px',
            width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            animation: 'fadeSlideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}>
            <h2 style={{ margin: '0 0 6px', color: '#2774ae', fontSize: '24px' }}>
              Confirm Your Post
            </h2>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
              Please review your post details before submitting.
            </p>

            <div style={{ background: '#f5f8fc', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: '700', color: '#172033' }}>
                📍 {parkingStructure}
              </p>

              <p style={{ margin: '0 0 6px', fontWeight: '700', color: '#172033', fontSize: '14px' }}>
                Schedule:
              </p>
              {schedule.map((item, i) => (
                <p key={i} style={{ margin: '2px 0 2px 12px', fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                  • <strong>{item.day}</strong>: {formatTime(item.startTime)} – {formatTime(item.endTime)}
                </p>
              ))}

              {notes && (
                <>
                  <p style={{ margin: '10px 0 4px', fontWeight: '700', color: '#172033', fontSize: '14px' }}>
                    Notes:
                  </p>
                  <p style={{ margin: '0 0 0 12px', fontSize: '14px', color: '#374151' }}>
                    {notes}
                  </p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '10px 22px', border: '2px solid #2774ae', borderRadius: '8px',
                  background: 'white', color: '#2774ae', fontWeight: '700', cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                style={{
                  padding: '10px 22px', background: '#2774ae', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '700',
                  cursor: 'pointer', fontSize: '15px',
                }}
              >
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CreatePost;