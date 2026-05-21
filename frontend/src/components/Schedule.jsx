function Schedule({ schedule, onToggleTimeBlock }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeBlocks = ['morning', 'afternoon', 'evening'];

  return (
    <div className="schedule-grid">
      {days.map((day) => (
        <div className="schedule-day" key={day}>
          <h3>{day}</h3>

          {timeBlocks.map((timeBlock) => (
            <label key={timeBlock}>
              <input
                type="checkbox"
                checked={schedule[day].includes(timeBlock)}
                onChange={() => onToggleTimeBlock(day, timeBlock)}
              />
              {timeBlock}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Schedule;