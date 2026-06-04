
import { useState } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';
import { createPost } from '../api/postsApi';

import { PARKING_STRUCTURES, WEEKDAYS } from '../utils/constants';
import { mergeSchedule } from '../utils/scheduleUtils';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/createPost.css';


function CreatePost() {
  const [parkingStructure, setParkingStructure] = useState('');
  const [notes, setNotes] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState('');
  const {user, status} = useCurrentUser();
  
  function getPostTypeNote(){
    if(status === "Loading"){
      return "Checking your permit status...";
    }
    if(user?.verificationStatus === "verified"){
      return "Because your permit is verified, this post will be marked as 'Offering parking permit'.";
    }
    return "Because your permit isn't verified, this post will be marked as 'Looking for parking permit'.";
  }


  function addScheduleItem(){
    if(!day || !startTime || !endTime){
      return;
    }

    // Fixed bug: end time equal to or before start time (e.g. MON 1:00pm–12:00pm) was silently
    // accepted — now rejected with an error message before the block is added.
    if(endTime <= startTime){
      setMessage("End time must be after start time.");
      return;
    }

    // Fixed bug: adding a block that overlapped an existing one on the same day created
    // duplicate/conflicting entries — now merged into a single block covering the full min-max range.
    setSchedule(prev => mergeSchedule(prev, { day, startTime, endTime }));
    setMessage('');
    setDay('');
    setStartTime('');
    setEndTime('');
  }


  async function submitPost(event){
    event.preventDefault();
    setMessage('');

    if(!parkingStructure){
      setMessage("Please select a parking structure.");
      return;
    }

    if(schedule.length === 0){
      setMessage("Please add at least one schedule item.");
      return;
    }
    try{
      await createPost({
        parkingStructure,
        schedule,
        notes,
      });

      setMessage("Parking post successfully created.");
      setParkingStructure('');
      setNotes('');
      setSchedule([]);
      setDay('');
      setStartTime('');
      setEndTime('');
    }
    catch(err){
      setMessage(err.message || "Failed to create parking post.");
    }
  }

  return (
  <AppLayout>
    <PageHeader
      label="Create Post"
      title="Create a parking post"
      description="Share your parking structure and weekly schedule so other commuters can find compatible matches."
    />

    <div className="create-post-layout">
      <Card className="create-post-form-card">
        <form className="create-post-form" onSubmit={submitPost}>
          <label>
            Parking Structure

            <select
              value={parkingStructure}
              onChange={(event) => setParkingStructure(event.target.value)}
            >
              <option value="">Select a structure</option>
              {PARKING_STRUCTURES.map(s => <option key={s} value={s}>{s}</option>)} 
            </select>
          </label>

          <label>
            Notes

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: I usually stay late on Monday for club meetings."
            />
          </label>

          <div className="create-post-schedule-section">
            <div>
              <h2>Weekly Schedule</h2>
              <p>Add the times you expect to need parking.</p>
            </div>

            <div className="create-post-schedule-inputs">
              <label>
                Day

                <select value={day} onChange={(event) => setDay(event.target.value)}>
                  <option value="">Select a day</option>
                  {WEEKDAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
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

              <Button type="button" variant="secondary" onClick={addScheduleItem}>
                Add Time
              </Button>
            </div>

            <div className="create-post-schedule-list">
              {schedule.length === 0 && (
                <p>No schedule times added yet.</p>
              )}

              {schedule.map((item, index) => (
                <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                  <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                </p>
              ))}
            </div>
          </div>

          <div className="create-post-actions">
            <Button type="submit">
              Create Post
            </Button>
          </div>

          {message && (
            <p className="create-post-message">{message}</p>
          )}
        </form>
      </Card>

      <Card className="create-post-info-card">
        <h2>Post Type</h2>
        <p>{getPostTypeNote()}</p>

        <div className="create-post-preview">
          <h3>Preview</h3>
          <p><strong>Structure:</strong> {parkingStructure || "None selected"}</p>
          <p><strong>Schedule items:</strong> {schedule.length}</p>
          <p><strong>Notes:</strong> {notes || "No notes yet"}</p>
        </div>
      </Card>
    </div>
  </AppLayout>
);
}

export default CreatePost;