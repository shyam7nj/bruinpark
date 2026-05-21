import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Schedule from '../components/Schedule';

const API_URL = 'http://localhost:3001';

const defaultSchedule = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
};

function CreatePost() {
  const [parkingStructure, setParkingStructure] = useState('');
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  function toggleTimeBlock(day, timeBlock) {
    setSchedule((currentSchedule) => {
      const currentBlocks = currentSchedule[day];
      const alreadySelected = currentBlocks.includes(timeBlock);

      return {
        ...currentSchedule,
        [day]: alreadySelected
          ? currentBlocks.filter((block) => block !== timeBlock)
          : [...currentBlocks, timeBlock],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch(`${API_URL}/api/posts`, {
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
      setSchedule(defaultSchedule);
      setNotes('');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Failed to create parking post.');
    }
  }

  return (
    <PageLayout>
      <h1>Create Parking Post</h1>

      <form className="post-form" onSubmit={handleSubmit}>
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
          </select>
        </label>

        <h2>Schedule</h2>
        <p>Select the times you expect to need parking.</p>

        <Schedule
          schedule={schedule}
          onToggleTimeBlock={toggleTimeBlock}
        />

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Example: I usually stay late Wednesday for club meetings."
          />
        </label>

        <button className="button" type="submit">
          Submit Post
        </button>
      </form>

      {message && <p>{message}</p>}

      <a className="button secondary" href="/dashboard">
        Back to dashboard
      </a>
    </PageLayout>
  );
}

export default CreatePost;