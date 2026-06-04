/*
  Reusable schedule display component for refactoring..
  First, to12h renders each time block as "day: startTime - endTime" into 12h format 
  Now, ScheduleList can be used anywhere a post's weekly schedule needs to be displayed.
  To change how schedule items look across the whole app, update this file.
*/

// Converts a 24h military time format "HH:MM"  -> a 12h "h:MM AM/PM" string.
function to12h(time) {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

function ScheduleList({ schedule }) {
  return schedule?.map((item, index) => (
    <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
      <strong>{item.day}:</strong> {to12h(item.startTime)} - {to12h(item.endTime)}
    </p>
  ));
}

export default ScheduleList;
