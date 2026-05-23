import {useState} from 'react';


function CreatePost() {
  const [parkingStructure, setParkingStructure] = useState('');
  const [notes, setNotes] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState('');

  function addScheduleItem(){
    if(!day || !startTime || !endTime){
      return;
    }

    const newScheduleItem = {
      day, startTime, endTime,
    };

    setSchedule([...schedule, newScheduleItem]);
    setDay('');
    setStartTime('');
    setEndTime('');
  }

  async function submitPost(event) {
  event.preventDefault();

  setMessage('');

  const response = await fetch('http://localhost:3001/api/posts', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parkingStructure,
      schedule,
      notes,
    }),
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
              onChange={(event) => setParkingStructure(event.target.value)}
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
         <p>Selected: {parkingStructure || "None Yet"}</p>
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: I usually stay late on Monday for club meetings."
            />
          </label>
          <p>
            Notes Preview: {notes || "No notes yet"}
          </p>

          <div className="schedule-section">
  <h2>Weekly Schedule</h2>

  <p>Add the exact times you expect to need parking.</p>

  <label>
    Day
    <select value={day} onChange={(event) => setDay(event.target.value)}>
      <option value="">Select a day</option>
      <option value="monday">Monday</option>
      <option value="tuesday">Tuesday</option>
      <option value="wednesday">Wednesday</option>
      <option value="thursday">Thursday</option>
      <option value="friday">Friday</option>
    </select>
  </label>

  <label>
    Start Time
    <input
      type="time"
      value={startTime}
      onChange={(event) => setStartTime(event.target.value)}
    />
  </label>

  <label>
    End Time
    <input
      type="time"
      value={endTime}
      onChange={(event) => setEndTime(event.target.value)}
    />
  </label>

  <button type="button" className="home-login-button" onClick={addScheduleItem}>
    Add Time
  </button>

  <div className="schedule-list">
    {schedule.length === 0 && <p>No schedule times added yet.</p>}

    {schedule.map((item, index) => (
      <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
        {item.day}: {item.startTime} - {item.endTime}
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