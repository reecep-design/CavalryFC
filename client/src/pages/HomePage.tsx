import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeams, Team } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null); // Dynamic content
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchTeams().then(setTeams),
      fetch(`${API_URL}/content/home_info`).then(res => res.json()).then(data => {
        if (data) setContent(data);
      }).catch(err => console.error('Content fetch error:', err))
    ])
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-900 font-medium animate-pulse">
      Loading...
    </div>
  );

  const boysTeams = teams.filter(t => t.name.toLowerCase().includes('boys'));
  const girlsTeams = teams.filter(t => t.name.toLowerCase().includes('girls'));

  const sortTeams = (a: Team, b: Team) => {
    const yearA = parseInt(a.name.match(/\d{4}/)?.[0] || '0');
    const yearB = parseInt(b.name.match(/\d{4}/)?.[0] || '0');
    return yearB - yearA;
  };

  boysTeams.sort(sortTeams);
  girlsTeams.sort(sortTeams);

  const TeamCard = ({ team }: { team: Team }) => {
    const spotsLeft = Math.max(0, team.capacity - (team.registrationCount || 0));
    const isFull = spotsLeft === 0;

    return (
      <div key={team.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">

        {/* Top Gradient Bar */}
        <div className={`h-2 w-full ${!team.open || isFull ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-blue-700 to-blue-500'}`}></div>

        <div className="p-7 flex-grow">
          <h3 className="text-2xl font-extrabold text-blue-900 mb-4 tracking-tight group-hover:text-blue-700 transition-colors">
            {team.name}
          </h3>

          {/* Description */}
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium mb-6">
            {team.description}
          </div>
        </div>

        <div className="px-7 pb-7 pt-4 border-t border-gray-50 bg-gray-50/50 mt-auto">
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Seasonal Fee</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-blue-900 tracking-tighter">
                  {formatPrice(team.priceCents)}
                </p>
              </div>
            </div>
            <div className="text-right pb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${!team.open || isFull
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : spotsLeft <= 3
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${!team.open || isFull ? 'bg-amber-500' : spotsLeft <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                {!team.open ? 'Waitlist Only' : isFull ? 'Team Full' : `${spotsLeft} spots left`}
              </span>
            </div>
          </div>

          {!team.open || isFull ? (
            <button
              onClick={() => navigate(`/register/${team.id}?mode=waitlist`)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Join Waitlist</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/register/${team.id}`)}
              className="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group-hover:bg-blue-700"
            >
              <span>Register Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            {/* Logo with nice drop shadow and border */}
            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-blue-900/5 rotate-0 hover:rotate-2 transition-transform duration-500">
              <img
                src="/cavalry-logo.jpg"
                alt="Cavalry FC Logo"
                className="h-32 w-auto md:h-40 object-contain"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-blue-900 mb-6 tracking-tight leading-tight">
            Cavalry FC <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Spring Season</span>
          </h1>

          <div className="max-w-4xl mx-auto mt-12 mb-16 space-y-8 text-left bg-white/80 p-8 md:p-10 rounded-3xl border border-blue-100 shadow-xl backdrop-blur-sm hover:border-blue-200 transition-colors">

            <div>
              <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                {content?.program_header}
              </h3>
              <div className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
                {content?.program_body}
              </div>

              {/* Seasonal Fee - Always styled nicely, just text is editable */}
              <div className="mt-4">
                <span className="inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                  {content?.seasonal_fee}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                  {content?.schedule_header}
                </h3>
                <div className="text-slate-600 leading-relaxed text-sm space-y-4 whitespace-pre-line">
                  {content?.schedule_body}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-blue-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                  {content?.coaches_header}
                </h3>
                <div className="text-slate-600 leading-relaxed text-sm space-y-4 whitespace-pre-line">
                  {content?.coaches_body}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Questions?</h3>
                <p className="text-slate-600 text-sm">
                  Contact Mr. Reece at <a href="mailto:reecep@cavalryboosterclub.org" className="text-blue-600 hover:underline decoration-2 underline-offset-2">reecep@cavalryboosterclub.org</a> or 734-904-8320.
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">To Register</h3>
                <p className="text-slate-600 text-sm">
                  Find the <strong>appropriate birth year</strong> below and complete the form.
                </p>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/donate')}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              Support the Club — Donate
            </button>
            <button
              onClick={() => navigate('/reimburse')}
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-800 font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-base border border-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Cash Reimbursement
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-10 animate-bounce text-blue-300">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Girls Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 .9-.9 2-2 2v2h2v-2.1c0-1.6 1.4-3.9 3-3.9 2.22 0 4-1.78 4-4 0-2.21-1.79-4-4-4z" /></svg>
                {/* Just a generic icon, can be replaced */}
              </div>
              <h2 className="text-3xl font-bold text-blue-900">Girls Teams</h2>
            </div>
            <div className="grid gap-6">
              {girlsTeams.map(team => <TeamCard key={team.id} team={team} />)}
            </div>
          </div>

          {/* Boys Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-100">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-blue-900">Boys Teams</h2>
            </div>
            <div className="grid gap-6">
              {boysTeams.map(team => <TeamCard key={team.id} team={team} />)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-slate-400 text-sm pb-8 border-t border-slate-200 pt-8">
          <p>&copy; {new Date().getFullYear()} Cavalry FC Booster Club. All rights reserved.</p>
          <div className="mt-4">
            <button onClick={() => navigate('/admin')} className="text-slate-300 hover:text-blue-500 transition-colors">
              Admin Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
