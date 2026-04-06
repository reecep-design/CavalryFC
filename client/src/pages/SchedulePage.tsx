import { useNavigate } from 'react-router-dom';

const CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FDetroit&showPrint=0&src=Y19hZDY5ZjQxOTNmOTA0Y2I2YjhiYTVlZjBjOTlkNjE0ZDc3MmMyMGQ2ZWE3NTIyMmNlYTkwNDE1YjFmMGM3MGYyQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mNWExODA3YTI4MDAzYTQ5ZDlkOTBiZjQ1YzFiNTdiODAzYzljZDk2NzNmNzc0NTk2OGQ4ZmQwMjgwMGM0OGVjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y18xYWVmM2Q1NThjM2NjOWUyMjM2ZTVjMTlhMTQ0YWY3ZjZkMGQ4ZGMwODc4M2I5YTQ0MzdlNTFhYWUzODQ4YjE3QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19hNTg0OGUyMTE1OGUyZTFhNjhjYWFmYzU3M2QzZGMxZThkNjEwODI1YWJkYmIxZmQ1YjQwMTFlNjVkMWY3NzQ3QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23e67c73&color=%23f09300&color=%23f6bf26&color=%23009688';

const CALENDARS = [
  { label: '2012 Boys', color: '#e67c73' },
  { label: '2014 Boys', color: '#f09300' },
  { label: '2016 Boys', color: '#f6bf26' },
  { label: '2017 Girls', color: '#009688' },
];

export function SchedulePage() {
  const navigate = useNavigate();

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
            Practice and game schedules for all Cavalry FC teams. Toggle teams on and off using the checkboxes below the calendar.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {CALENDARS.map(c => (
            <div key={c.label} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c.color }}
              ></span>
              <span className="text-sm font-bold text-slate-700">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Embed */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <iframe
            src={CALENDAR_EMBED_URL}
            style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#777' }}
            width="100%"
            height="600"
            className="w-full"
            title="Cavalry FC Team Schedules"
          ></iframe>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Cavalry FC Booster Club. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
