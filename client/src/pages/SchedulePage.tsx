import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CALENDARS = [
  { id: 'c_ad69f4193f904cb6b8ba5ef0c99d614d772c20d6ea75222cea90415b1f0c70f2@group.calendar.google.com', label: '2012 Boys', color: '#e67c73' },
  { id: 'c_f5a1807a28003a49d9d90bf45c1b57b803c9cd9673f7745968d8fd02800c48ec@group.calendar.google.com', label: '2014 Boys', color: '#f09300' },
  { id: 'c_1aef3d558c3cc9e2236e5c19a144af7f6d0d8dc08783b9a4437e51aae3848b17@group.calendar.google.com', label: '2016 Boys', color: '#f6bf26' },
  { id: 'c_a5848e21158e2e1a68caafc573d3dc1e8d610825abdbb1fd5b4011e65d1f7747@group.calendar.google.com', label: '2017 Girls', color: '#009688' },
];

function buildCalendarUrl(selected: Set<string>) {
  const base = 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FDetroit&showPrint=0';
  const active = CALENDARS.filter(c => selected.has(c.id));
  const srcParams = active.map(c => `&src=${encodeURIComponent(c.id)}&color=${encodeURIComponent(c.color)}`).join('');
  return base + srcParams;
}

export function SchedulePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set(CALENDARS.map(c => c.id)));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight mb-3">
            Team Schedules
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Practice and game schedules for all Cavalry FC teams. Use the checkboxes to filter by team.
          </p>
        </div>

        {/* Team Checkboxes */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {CALENDARS.map(c => (
            <label
              key={c.id}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm border cursor-pointer transition-all ${
                selected.has(c.id)
                  ? 'bg-white border-gray-200 shadow-md'
                  : 'bg-gray-100 border-gray-100 opacity-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors ${
                  selected.has(c.id) ? 'border-transparent' : 'border-gray-300 bg-white'
                }`}
                style={selected.has(c.id) ? { backgroundColor: c.color } : {}}
              >
                {selected.has(c.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                )}
              </span>
              <span className="text-sm font-bold text-slate-700">{c.label}</span>
            </label>
          ))}
        </div>

        {/* Calendar Embed */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {selected.size > 0 ? (
            <iframe
              key={Array.from(selected).sort().join(',')}
              src={buildCalendarUrl(selected)}
              style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#777' }}
              width="100%"
              height="600"
              className="w-full"
              title="Cavalry FC Team Schedules"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-slate-400 text-lg font-medium">
              Select at least one team to view the schedule.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Cavalry FC Booster Club. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
