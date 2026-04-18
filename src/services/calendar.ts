import type { Group } from './groups';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toICSDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildICS(group: Group): string {
  // group.meetingTime examples: "Wed, April 10, 6:00PM" / "Mondays, 4-6 PM"
  // Best-effort parse; fall back to "now + 1 hour" if unparseable.
  const start = parseMeetingTime(group.meetingTime) ?? new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Huddle//Study Group//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:huddle-${group.id}@huddle.app`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(group.name || group.course || 'Huddle Study Group')}`,
    `DESCRIPTION:${escapeICS(group.description || '')}`,
    `LOCATION:${escapeICS(group.meetingPlace || '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function parseMeetingTime(text?: string): Date | null {
  if (!text) return null;
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d;
  // Try appending current year for strings like "April 10, 6:00PM"
  const y = new Date().getFullYear();
  const d2 = new Date(`${text} ${y}`);
  if (!isNaN(d2.getTime())) return d2;
  return null;
}

export function downloadICS(group: Group) {
  const ics = buildICS(group);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safe = (group.name || group.course || 'event').replace(/[^a-z0-9-_]+/gi, '-');
  a.download = `huddle-${safe}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
