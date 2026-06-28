export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: "project" | "invoice" | "proposal" | "reminder";
  color: "red" | "blue" | "green" | "yellow" | "purple" | "gray";
  url?: string; // Optional link to view the entity
};

type Props = {
  year: number;
  month: number; // 0-indexed (0 = Jan)
  events: CalendarEvent[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ year, month, events }: Props) {
  // Calculate days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const renderCells = () => {
    const cells = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-gray-50 border-r border-b p-2 min-h-[100px] md:min-h-[120px]" />);
    }
    
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = eventsByDate[dateStr] || [];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      cells.push(
        <div key={d} className={`border-r border-b p-2 min-h-[100px] md:min-h-[120px] transition-colors ${isToday ? 'bg-indigo-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
            {d}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
            {dayEvents.map(evt => (
              <div
                key={evt.id}
                className={`text-xs px-1.5 py-0.5 rounded truncate ${getColorClasses(evt.color)}`}
                title={evt.title}
              >
                {evt.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Fill remaining cells to complete the grid (if necessary to look nice)
    const totalCells = cells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="bg-gray-50 border-r border-b p-2 min-h-[100px] md:min-h-[120px]" />);
    }
    
    return cells;
  };

  const getColorClasses = (color: CalendarEvent['color']) => {
    switch (color) {
      case "red": return "bg-red-100 text-red-800";
      case "blue": return "bg-blue-100 text-blue-800";
      case "green": return "bg-emerald-100 text-emerald-800";
      case "yellow": return "bg-amber-100 text-amber-800";
      case "purple": return "bg-purple-100 text-purple-800";
      case "gray": default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-t border-l">
        {renderCells()}
      </div>
    </div>
  );
}
