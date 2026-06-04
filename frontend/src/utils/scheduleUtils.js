/*
  Schedule utility helpers.
  mergeSchedule: adds a new time block to an existing schedule, merging any
  overlapping or adjacent blocks on the same day into a single block.
  Time strings are in "HH:MM" (24h) format, so lexicographic comparison is correct.
*/

export function mergeSchedule(schedule, newItem) {
  const otherDays = schedule.filter(s => s.day !== newItem.day);
  const sameDay   = schedule.filter(s => s.day === newItem.day);

  // Include the new item and sort by start time
  const sorted = [...sameDay, newItem].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Merge overlapping / adjacent blocks
  const merged = [];
  for (const item of sorted) {
    const last = merged[merged.length - 1];
    if (!last || item.startTime > last.endTime) {
      // No overlap — push a copy so we don't mutate the original
      merged.push({ ...item });
    } else {
      // Overlap or adjacent — extend the end time if needed
      last.endTime = last.endTime > item.endTime ? last.endTime : item.endTime;
    }
  }

  return [...otherDays, ...merged];
}
