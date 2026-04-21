import { useState } from 'react';
import {
  ArrowLeft, Settings, X, Check, Users, MessageSquare,
  Sparkles, EyeOff, Briefcase, Heart, Bell, Clock,
  CheckCircle2, MapPin, UserPlus, Send, Camera, User,
  ChevronRight, Music, Film, BookOpen, Plane, Pencil
} from 'lucide-react';

export default function ProximityAppDemo() {
  const [screen, setScreen] = useState('welcome');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [mode, setMode] = useState('social');
  const [actionTaken, setActionTaken] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [radius, setRadius] = useState('venue');
  const [visible, setVisible] = useState(true);
  const [profileMode, setProfileMode] = useState('social'); // which profile variant being edited
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // ============ DATA ============

  const allPeople = [
    {
      id: 1, name: 'Maya R.', age: 28, mode: 'social',
      distance: 'in this room', distanceCategory: 'room',
      accent: '#FF2D87', initials: 'MR',
      bio: 'Designer, ex-NYC, figuring out Berlin.',
      talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
      starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
      dontTalk: ['my ex', 'politics']
    },
    {
      id: 2, name: 'Daniel K.', age: 34, mode: 'work',
      distance: 'in this venue', distanceCategory: 'venue',
      accent: '#4F46E5', initials: 'DK',
      bio: 'Building a dev tools startup. Looking for design feedback.',
      talkAbout: ['dev tooling', 'B2B pricing', 'running a tiny team'],
      starters: ['What are you building?', 'Favorite engineering blog?', 'Mac or Linux?'],
      dontTalk: ['compensation', 'crypto']
    },
    {
      id: 3, name: 'Priya S.', age: 26, mode: 'social',
      distance: '12m away', distanceCategory: 'venue',
      accent: '#FF8A00', initials: 'PS',
      bio: 'PhD candidate in cognitive science. New in town.',
      talkAbout: ['weird brain stuff', 'vintage cameras', 'good dosa spots'],
      starters: ['Reading anything good?', 'Favorite museum here?', 'Coffee shop recs?'],
      dontTalk: ['academia gossip']
    },
    {
      id: 4, name: 'Marco T.', age: 31, mode: 'work',
      distance: 'in this venue', distanceCategory: 'venue',
      accent: '#A855F7', initials: 'MT',
      bio: 'Product lead at a fintech. Here for the AI track.',
      talkAbout: ['LLM evals', 'PM career paths', 'Italy'],
      starters: ['What talk are you most excited for?', 'Where\u2019d you fly in from?', 'Specialty coffee?'],
      dontTalk: ['my old company']
    },
    {
      id: 5, name: 'Aisha O.', age: 29, mode: 'social',
      distance: 'in this room', distanceCategory: 'room',
      accent: '#06D6A0', initials: 'AO',
      bio: 'Writing my first novel. Here for the quiet wifi.',
      talkAbout: ['speculative fiction', 'tarot', 'cold-water swimming'],
      starters: ['What are you working on?', 'Last film that wrecked you?', 'Tea order?'],
      dontTalk: ['publishing industry']
    },
    {
      id: 6, name: 'Jonas W.', age: 36, mode: 'work',
      distance: 'nearby', distanceCategory: 'area',
      accent: '#F43F5E', initials: 'JW',
      bio: 'CTO at a climate hardware startup. Always hiring.',
      talkAbout: ['carbon removal', 'hardware vs. software', 'hiring'],
      starters: ['What problem are you obsessed with?', 'How big is your team?', 'Berlin or SF?'],
      dontTalk: ['Twitter']
    }
  ];

  const findPerson = (id) => allPeople.find(p => p.id === id);

  const connections = [
    { personId: 3, state: 'received', time: '12m' },
    { personId: 1, state: 'mutual', lastMsg: 'That bookbinding spot was \ud83d\udd25', time: '2h', unread: true },
    { personId: 2, state: 'mutual', lastMsg: 'You: let\u2019s grab coffee tomorrow', time: '1d', unread: false },
    { personId: 4, state: 'sent', time: '1h' },
    { personId: 5, state: 'sent', time: '3h' }
  ];

  const pendingReceived = connections.filter(c => c.state === 'received').length;

  const activity = [
    { id: 'a1', type: 'received', personId: 3, time: '12m', when: 'today' },
    { id: 'a2', type: 'accepted', personId: 2, time: '1h', when: 'today' },
    { id: 'a3', type: 'crossed', personId: 6, time: '2h', venue: 'Blue Bottle, Mitte', when: 'today' },
    { id: 'a4', type: 'newNearby', count: 4, time: '4h', when: 'today' },
    { id: 'a5', type: 'plans', personId: 1, time: '1d', when: 'yesterday' },
    { id: 'a6', type: 'venue', venue: 'SaaStr Berlin', count: 47, time: '2d', when: 'earlier' }
  ];

  const recentActivity = activity.filter(a => a.when === 'today').length;

  const visiblePeople = mode === 'off' ? [] : allPeople.filter(p => p.mode === mode);
  const accentColor = mode === 'work' ? '#4F46E5' : '#FF2D87';

  // ============ COMPONENTS ============

  const WelcomeScreen = () => (
    <div className="h-full flex flex-col bg-cream px-7 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full opacity-50"
           style={{ background: 'radial-gradient(circle, #FF2D87 0%, transparent 65%)' }} />
      <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full opacity-35"
           style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 65%)' }} />
      <div className="absolute top-1/3 -right-10 w-32 h-32 rounded-full opacity-25"
           style={{ background: 'radial-gradient(circle, #D9F65C 0%, transparent 70%)' }} />

      <div className="relative flex-1 flex flex-col justify-between z-10">
        <div className="pt-6">
          <div className="font-display italic text-2xl text-ink tracking-tight">Proximity</div>
        </div>

        <div className="space-y-6">
          <h1 className="font-display text-[44px] leading-[1.05] text-ink tracking-tight">
            Meet the people<br />
            <span className="italic">in the room.</span>
          </h1>
          <p className="font-body text-[15px] text-muted leading-relaxed max-w-[280px]">
            A quiet, opt-in way to discover and connect with the people physically near you \u2014 at conferences, on campus, in caf\u00e9s.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setScreen('setup')}
            className="w-full py-4 rounded-full font-body font-medium text-white text-[15px] transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#12101C', boxShadow: '0 12px 30px -10px rgba(18,16,28,0.5)' }}
          >
            Set up your profile
          </button>
          <button
            onClick={() => setScreen('discover')}
            className="w-full py-3 font-body text-[14px] text-muted underline-offset-4 hover:underline"
          >
            Skip to the demo
          </button>
        </div>
      </div>
    </div>
  );

  const SetupScreen = () => {
    const questions = [
      { label: 'Three things to talk to me about', placeholder: 'e.g. surfing', icon: Sparkles, examples: ['surfing', 'horror movies', 'Tokyo travel tips'], iconColor: '#FF2D87' },
      { label: 'Three conversation starters', placeholder: 'e.g. What brought you here?', icon: MessageSquare, examples: ['What brought you here?', 'Best meal this week?', 'What are you working on?'], iconColor: '#4F46E5' },
      { label: 'Three things NOT to talk about', placeholder: 'e.g. work drama', icon: EyeOff, examples: ['work drama', 'my dating life', ''], iconColor: '#A8A3B8' }
    ];

    return (
      <div className="h-full flex flex-col bg-cream">
        <div className="px-6 pt-12 pb-4 flex items-center justify-between">
          <button onClick={() => setScreen('welcome')} className="text-ink">
            <ArrowLeft size={20} />
          </button>
          <div className="font-body text-xs text-muted tracking-wider uppercase">Step 1 of 1</div>
          <div className="w-5" />
        </div>

        <div className="px-6 pb-2">
          <h2 className="font-display text-[28px] leading-tight text-ink">Your profile,<br/><span className="italic">in nine answers.</span></h2>
          <p className="font-body text-[13px] text-muted mt-2">Separate answers for Work and Social mode.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-6">
          {questions.map((q, i) => {
            const Icon = q.icon;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: q.iconColor }} />
                  <div className="font-body text-[12px] uppercase tracking-wider text-ink">{q.label}</div>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map(idx => (
                    <input
                      key={idx}
                      type="text"
                      defaultValue={q.examples[idx]}
                      placeholder={q.placeholder}
                      className="w-full px-4 py-3 bg-surface rounded-2xl font-display italic text-[15px] text-ink placeholder:text-faint placeholder:not-italic placeholder:font-body focus:outline-none border border-warm focus:border-ink transition-colors"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-cream via-cream to-transparent">
          <button
            onClick={() => setScreen('discover')}
            className="w-full py-4 rounded-full font-body font-medium text-white text-[15px] transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#12101C' }}
          >
            Done \u2014 see who\u2019s nearby
          </button>
        </div>
      </div>
    );
  };

  const DiscoverScreen = () => {
    const grouped = {
      room: visiblePeople.filter(p => p.distanceCategory === 'room'),
      venue: visiblePeople.filter(p => p.distanceCategory === 'venue'),
      area: visiblePeople.filter(p => p.distanceCategory === 'area')
    };

    return (
      <div className="h-full flex flex-col bg-cream">
        <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-cream">
          <div className="font-display italic text-xl text-ink">Proximity</div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border border-warm"
          >
            <Settings size={16} className="text-ink" />
          </button>
        </div>

        <div className="px-6 pb-3">
          <div className="bg-surface rounded-full p-1 flex border border-warm relative">
            <div
              className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
              style={{
                backgroundColor: mode === 'off' ? '#A8A3B8' : accentColor,
                left: mode === 'off' ? '4px' : mode === 'social' ? '33.33%' : '66.66%',
                width: 'calc(33.33% - 4px)',
                boxShadow: mode === 'off' ? 'none' : `0 6px 18px -4px ${accentColor}88`
              }}
            />
            {[
              { key: 'off', label: 'Off', Icon: EyeOff },
              { key: 'social', label: 'Social', Icon: Heart },
              { key: 'work', label: 'Work', Icon: Briefcase }
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex-1 py-2.5 rounded-full font-body text-[13px] font-medium z-10 transition-colors flex items-center justify-center gap-1.5 ${
                  mode === key ? 'text-white' : 'text-muted'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-3 flex items-center gap-2">
          {mode !== 'off' ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: accentColor }} />
              </div>
              <div className="font-body text-[12px] text-muted">
                Visible to nearby \u00b7 {visiblePeople.length} people in {mode} mode
              </div>
            </>
          ) : (
            <div className="font-body text-[12px] text-muted">
              You\u2019re invisible. Tap Social or Work to be discoverable.
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {mode === 'off' ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <div className="w-16 h-16 rounded-full bg-surface border border-warm flex items-center justify-center mb-4">
                <EyeOff size={24} className="text-faint" />
              </div>
              <div className="font-display text-[20px] italic text-ink mb-1">You\u2019re off the radar.</div>
              <div className="font-body text-[13px] text-muted max-w-[240px]">
                Flip on a mode when you\u2019re ready to see and be seen.
              </div>
            </div>
          ) : (
            <>
              {[
                { key: 'room', label: 'In this room', sublabel: 'detected via Bluetooth' },
                { key: 'venue', label: 'In this venue', sublabel: 'within ~100m' },
                { key: 'area', label: 'Nearby', sublabel: 'within ~1km' }
              ].map(section => grouped[section.key].length > 0 && (
                <div key={section.key} className="mb-6">
                  <div className="flex items-baseline justify-between mb-3 pt-2">
                    <div className="font-body font-medium text-[13px] text-ink uppercase tracking-wider">
                      {section.label}
                    </div>
                    <div className="font-body text-[11px] text-faint">{section.sublabel}</div>
                  </div>
                  <div className="space-y-2.5">
                    {grouped[section.key].map(person => (
                      <button
                        key={person.id}
                        onClick={() => { setSelectedPerson(person); setActionTaken(null); setScreen('person'); }}
                        className="w-full bg-surface rounded-2xl p-4 flex gap-3 text-left border border-warm hover:border-ink transition-colors active:scale-[0.99] relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: person.accent }} />
                        <div className="relative flex-shrink-0 ml-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-body font-medium text-white text-[14px]"
                            style={{
                              backgroundColor: person.accent,
                              boxShadow: `0 6px 18px -4px ${person.accent}aa`
                            }}
                          >
                            {person.initials}
                          </div>
                          {person.distanceCategory === 'room' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-cream flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D9F65C', boxShadow: '0 0 8px #D9F65C' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="font-body font-medium text-[15px] text-ink">
                              {person.name}, {person.age}
                            </div>
                            <div className="font-body text-[11px] text-faint flex-shrink-0">{person.distance}</div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {person.talkAbout.slice(0, 3).map((t, i) => (
                              <span key={i} className="font-display italic text-[12px] text-muted">
                                {t}{i < 2 && <span className="text-faint not-italic font-body"> \u00b7 </span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const PersonScreen = () => {
    if (!selectedPerson) return null;
    const p = selectedPerson;

    return (
      <div className="h-full flex flex-col bg-cream relative">
        <div className="px-6 pt-12 pb-3 flex items-center justify-between">
          <button onClick={() => setScreen('discover')} className="text-ink">
            <ArrowLeft size={20} />
          </button>
          <div className="font-body text-[11px] text-muted uppercase tracking-wider">{p.distance}</div>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-44">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-body font-medium text-white text-[26px]"
              style={{
                backgroundColor: p.accent,
                boxShadow: `0 14px 35px -8px ${p.accent}aa`
              }}
            >
              {p.initials}
            </div>
            <div>
              <div className="font-display text-[26px] text-ink leading-tight">{p.name}, {p.age}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {p.mode === 'work' ? <Briefcase size={11} className="text-muted" /> : <Heart size={11} className="text-muted" />}
                <span className="font-body text-[11px] uppercase tracking-wider text-muted">
                  {p.mode} mode
                </span>
              </div>
            </div>
          </div>

          <p className="font-body text-[14px] text-ink leading-relaxed mb-6 italic">
            \u201c{p.bio}\u201d
          </p>

          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles size={12} style={{ color: p.accent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Talk to me about</div>
              </div>
              <div className="space-y-1.5">
                {p.talkAbout.map((t, i) => (
                  <div key={i} className="font-display italic text-[18px] text-ink leading-snug">{t}</div>
                ))}
              </div>
            </div>

            <div className="border-t border-warm pt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <MessageSquare size={12} style={{ color: p.accent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Conversation starters</div>
              </div>
              <div className="space-y-2">
                {p.starters.map((s, i) => (
                  <div key={i} className="bg-surface border border-warm rounded-xl px-3.5 py-2.5">
                    <div className="font-body text-[13.5px] text-ink leading-snug">{s}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-warm pt-5 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={12} className="text-faint" />
                <div className="font-body text-[11px] uppercase tracking-wider text-faint">Don\u2019t talk about</div>
              </div>
              <div className="font-body text-[13px] text-faint">
                {p.dontTalk.join(' \u00b7 ')}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-5 bg-gradient-to-t from-cream via-cream to-transparent">
          <div className="space-y-2">
            <button
              onClick={() => { setActionTaken('hi'); }}
              className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: p.accent,
                boxShadow: `0 12px 30px -8px ${p.accent}cc`
              }}
            >
              <Sparkles size={15} />
              Say Hi
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { setActionTaken('plans'); }}
                className="flex-1 py-3 rounded-full font-body font-medium text-ink text-[14px] bg-surface border border-warm transition-transform active:scale-[0.98]"
              >
                Make Plans
              </button>
              <button
                onClick={() => setScreen('discover')}
                className="px-5 py-3 rounded-full font-body text-muted text-[14px] hover:text-ink transition-colors"
              >
                Not interested
              </button>
            </div>
          </div>
        </div>

        {actionTaken && (
          <div className="absolute inset-0 flex items-center justify-center px-8 z-20"
               style={{ backgroundColor: 'rgba(18, 16, 28, 0.55)' }}
               onClick={() => { setActionTaken(null); setScreen('discover'); }}>
            <div className="bg-cream rounded-3xl p-7 w-full max-w-[300px] text-center">
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{
                  backgroundColor: p.accent,
                  boxShadow: `0 12px 30px -8px ${p.accent}cc`
                }}
              >
                <Check size={26} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="font-display text-[22px] text-ink leading-tight mb-2">
                {actionTaken === 'hi' ? 'Hi sent.' : 'Invitation sent.'}
              </div>
              <div className="font-body text-[13px] text-muted leading-relaxed mb-5">
                {actionTaken === 'hi'
                  ? `We\u2019ll let you know when ${p.name.split(' ')[0]} responds. They won\u2019t see your interest if they pass.`
                  : `${p.name.split(' ')[0]} will see your invitation to make plans.`}
              </div>
              <button
                onClick={() => { setActionTaken(null); setScreen('discover'); }}
                className="font-body text-[13px] font-medium underline underline-offset-4"
                style={{ color: p.accent }}
              >
                Back to discover
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ConnectionsScreen = () => {
    const received = connections.filter(c => c.state === 'received');
    const mutual = connections.filter(c => c.state === 'mutual');
    const sent = connections.filter(c => c.state === 'sent');

    return (
      <div className="h-full flex flex-col bg-cream">
        <div className="px-6 pt-12 pb-3">
          <div className="font-display text-[26px] text-ink leading-tight">Connections</div>
          <div className="font-body text-[12px] text-muted mt-0.5">{mutual.length} mutual \u00b7 {received.length + sent.length} pending</div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {received.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mt-3 mb-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: '#FF2D87' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FF2D87' }} />
                </div>
                <div className="font-body font-medium text-[13px] text-ink uppercase tracking-wider">
                  Said hi to you
                </div>
              </div>
              <div className="space-y-2.5">
                {received.map(c => {
                  const p = findPerson(c.personId);
                  return (
                    <div key={c.personId}
                         className="bg-surface rounded-2xl p-4 border-2 relative overflow-hidden"
                         style={{ borderColor: p.accent, boxShadow: `0 8px 24px -10px ${p.accent}55` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-body font-medium text-white text-[14px] flex-shrink-0"
                             style={{ backgroundColor: p.accent, boxShadow: `0 6px 18px -4px ${p.accent}aa` }}>
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="font-body font-medium text-[15px] text-ink">{p.name}, {p.age}</div>
                            <div className="font-body text-[11px] text-faint">{c.time}</div>
                          </div>
                          <div className="font-display italic text-[13px] text-muted truncate">
                            {p.talkAbout.slice(0, 2).join(' \u00b7 ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedPerson(p); setActionTaken(null); setScreen('person'); }}
                          className="flex-1 py-2.5 rounded-full font-body font-medium text-white text-[13px]"
                          style={{ backgroundColor: p.accent, boxShadow: `0 6px 16px -6px ${p.accent}cc` }}
                        >
                          Say hi back
                        </button>
                        <button className="px-5 py-2.5 rounded-full font-body text-muted text-[13px] hover:text-ink">
                          Pass
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mutual.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mt-3 mb-3">
                <CheckCircle2 size={13} className="text-ink" />
                <div className="font-body font-medium text-[13px] text-ink uppercase tracking-wider">
                  Conversations
                </div>
              </div>
              <div className="space-y-2.5">
                {mutual.map(c => {
                  const p = findPerson(c.personId);
                  return (
                    <button key={c.personId}
                            className="w-full bg-surface rounded-2xl p-4 flex gap-3 text-left border border-warm hover:border-ink transition-colors active:scale-[0.99] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.accent }} />
                      <div className="relative flex-shrink-0 ml-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-body font-medium text-white text-[14px]"
                             style={{ backgroundColor: p.accent, boxShadow: `0 6px 18px -4px ${p.accent}aa` }}>
                          {p.initials}
                        </div>
                        {c.unread && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                               style={{ backgroundColor: '#FF2D87', boxShadow: '0 0 0 2px #FAFAFB' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="font-body font-medium text-[15px] text-ink">{p.name}</div>
                          <div className="font-body text-[11px] text-faint flex-shrink-0">{c.time}</div>
                        </div>
                        <div className={`font-body text-[13px] truncate ${c.unread ? 'text-ink' : 'text-muted'}`}>
                          {c.lastMsg}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sent.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mt-3 mb-3">
                <Clock size={12} className="text-faint" />
                <div className="font-body font-medium text-[13px] text-faint uppercase tracking-wider">
                  Waiting for them
                </div>
              </div>
              <div className="space-y-2">
                {sent.map(c => {
                  const p = findPerson(c.personId);
                  return (
                    <div key={c.personId}
                         className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-warm">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-body font-medium text-white text-[12px] opacity-70 flex-shrink-0"
                           style={{ backgroundColor: p.accent }}>
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-[13px] text-muted">
                          Hi sent to <span className="text-ink font-medium">{p.name}</span>
                        </div>
                      </div>
                      <div className="font-body text-[11px] text-faint">{c.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ActivityScreen = () => {
    const today = activity.filter(a => a.when === 'today');
    const yesterday = activity.filter(a => a.when === 'yesterday');
    const earlier = activity.filter(a => a.when === 'earlier');

    const renderEvent = (a) => {
      const p = a.personId ? findPerson(a.personId) : null;

      if (a.type === 'newNearby') {
        return (
          <div key={a.id} className="flex items-start gap-3 py-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: '#D9F65C', boxShadow: '0 4px 14px -3px rgba(217, 246, 92, 0.6)' }}>
              <UserPlus size={15} className="text-ink" />
            </div>
            <div className="flex-1 pt-0.5">
              <div className="font-body text-[14px] text-ink leading-snug">
                <span className="font-medium">{a.count} new people</span> nearby in social mode
              </div>
              <div className="font-body text-[11px] text-faint mt-0.5">{a.time}</div>
            </div>
          </div>
        );
      }

      if (a.type === 'venue') {
        return (
          <div key={a.id} className="flex items-start gap-3 py-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-surface border border-warm">
              <MapPin size={14} className="text-muted" />
            </div>
            <div className="flex-1 pt-0.5">
              <div className="font-body text-[14px] text-ink leading-snug">
                <span className="font-medium">{a.count} attendees</span> active at <span className="font-display italic">{a.venue}</span>
              </div>
              <div className="font-body text-[11px] text-faint mt-0.5">{a.time}</div>
            </div>
          </div>
        );
      }

      if (a.type === 'crossed') {
        return (
          <div key={a.id} className="flex items-start gap-3 py-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-body font-medium text-white text-[12px] flex-shrink-0"
                 style={{ backgroundColor: p.accent, boxShadow: `0 4px 14px -3px ${p.accent}aa` }}>
              {p.initials}
            </div>
            <div className="flex-1 pt-0.5">
              <div className="font-body text-[14px] text-ink leading-snug">
                You crossed paths with <span className="font-medium">{p.name}</span> at <span className="font-display italic">{a.venue}</span>
              </div>
              <div className="font-body text-[11px] text-faint mt-0.5">{a.time}</div>
            </div>
          </div>
        );
      }

      const eventConfig = {
        received: { Icon: Sparkles, text: 'said hi to you' },
        accepted: { Icon: CheckCircle2, text: 'accepted your hi' },
        plans: { Icon: Send, text: 'wants to make plans' }
      }[a.type];

      const Icon = eventConfig.Icon;

      return (
        <div key={a.id} className="flex items-start gap-3 py-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-body font-medium text-white text-[12px]"
                 style={{ backgroundColor: p.accent, boxShadow: `0 4px 14px -3px ${p.accent}aa` }}>
              {p.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-cream flex items-center justify-center">
              <Icon size={9} style={{ color: p.accent }} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <div className="font-body text-[14px] text-ink leading-snug">
              <span className="font-medium">{p.name}</span> {eventConfig.text}
            </div>
            <div className="font-body text-[11px] text-faint mt-0.5">{a.time}</div>
          </div>
          {a.type === 'received' && (
            <button
              onClick={() => setScreen('connections')}
              className="px-3 py-1.5 rounded-full text-[11px] font-body font-medium text-white"
              style={{ backgroundColor: p.accent, boxShadow: `0 4px 12px -3px ${p.accent}cc` }}
            >
              Reply
            </button>
          )}
        </div>
      );
    };

    return (
      <div className="h-full flex flex-col bg-cream">
        <div className="px-6 pt-12 pb-3">
          <div className="font-display text-[26px] text-ink leading-tight">Activity</div>
          <div className="font-body text-[12px] text-muted mt-0.5">Your recent moments</div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {today.length > 0 && (
            <div className="mt-3">
              <div className="font-body font-medium text-[11px] text-faint uppercase tracking-wider mb-1">Today</div>
              <div className="divide-y divide-warm">
                {today.map(renderEvent)}
              </div>
            </div>
          )}
          {yesterday.length > 0 && (
            <div className="mt-5">
              <div className="font-body font-medium text-[11px] text-faint uppercase tracking-wider mb-1">Yesterday</div>
              <div className="divide-y divide-warm">
                {yesterday.map(renderEvent)}
              </div>
            </div>
          )}
          {earlier.length > 0 && (
            <div className="mt-5">
              <div className="font-body font-medium text-[11px] text-faint uppercase tracking-wider mb-1">Earlier this week</div>
              <div className="divide-y divide-warm">
                {earlier.map(renderEvent)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const profileAccent = profileMode === 'work' ? '#4F46E5' : '#FF2D87';

    const hobbies = {
      social: ['bookbinding', 'cold-water swimming', 'vintage cameras', 'natural wine', 'hiking', 'ceramics'],
      work: ['design systems', 'founder coaching', 'type design', 'prototyping', 'user research']
    };

    const favorites = {
      social: [
        { Icon: BookOpen, label: 'Book', value: 'A Little Life' },
        { Icon: Film, label: 'Film', value: 'In the Mood for Love' },
        { Icon: Music, label: 'Artist', value: 'Mk.gee' },
        { Icon: Plane, label: 'City', value: 'Lisbon' }
      ],
      work: [
        { Icon: BookOpen, label: 'Book', value: 'Shape Up by Basecamp' },
        { Icon: Film, label: 'Doc', value: 'General Magic' },
        { Icon: Music, label: 'Podcast', value: 'Dithering' },
        { Icon: Plane, label: 'Conf', value: 'Config' }
      ]
    };

    const bios = {
      social: 'Designer in Berlin, ex-NYC. I\u2019m most awake around sunrise, worst at small talk, best at long walks.',
      work: 'Senior product designer. Leading design for a Series B developer tools startup. Open to advising.'
    };

    const answers = {
      social: {
        talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
        starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
        dontTalk: ['my ex', 'politics']
      },
      work: {
        talkAbout: ['design systems at scale', 'hiring your first designer', 'PM\u2194design friction'],
        starters: ['What are you building?', 'How\u2019s your team structured?', 'Biggest design debt you\u2019re carrying?'],
        dontTalk: ['compensation', 'my old company']
      }
    };

    return (
      <div className="h-full flex flex-col bg-cream">
        <div className="px-6 pt-12 pb-2 flex items-center justify-between">
          <div>
            <div className="font-display text-[26px] text-ink leading-tight">Your profile</div>
            <div className="font-body text-[12px] text-muted mt-0.5">Tap anything to edit</div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border border-warm">
            <Settings size={16} className="text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-3">
          {/* Photo + name */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => setPhotoUploaded(!photoUploaded)}
              className="relative group active:scale-95 transition-transform"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden relative"
                   style={{
                     background: photoUploaded
                       ? `linear-gradient(135deg, ${profileAccent} 0%, #FF8A00 50%, #F43F5E 100%)`
                       : '#FFFFFF',
                     boxShadow: photoUploaded ? `0 16px 40px -10px ${profileAccent}99` : '0 8px 24px -8px rgba(18,16,28,0.2)',
                     border: photoUploaded ? 'none' : '2px dashed #CFC9D9'
                   }}>
                {photoUploaded ? (
                  <div className="w-full h-full flex items-center justify-center font-display text-white text-[40px] italic">
                    M
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                    <Camera size={26} className="text-faint" strokeWidth={1.5} />
                    <div className="font-body text-[10px] text-faint uppercase tracking-wider">Add photo</div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                   style={{
                     backgroundColor: profileAccent,
                     boxShadow: `0 6px 16px -4px ${profileAccent}cc`
                   }}>
                {photoUploaded ? <Pencil size={13} className="text-white" /> : <Camera size={14} className="text-white" />}
              </div>
            </button>

            <div className="mt-4 text-center">
              <input
                type="text"
                defaultValue="Morgan L."
                className="font-display text-[24px] text-ink text-center bg-transparent border-none focus:outline-none w-full"
              />
              <div className="flex items-center justify-center gap-2 mt-1">
                <input
                  type="text"
                  defaultValue="29"
                  className="font-body text-[13px] text-muted bg-transparent border-none focus:outline-none w-8 text-right"
                />
                <div className="w-0.5 h-3 rounded-full bg-faint" />
                <input
                  type="text"
                  defaultValue="she/her"
                  className="font-body text-[13px] text-muted bg-transparent border-none focus:outline-none w-16"
                />
                <div className="w-0.5 h-3 rounded-full bg-faint" />
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-muted" />
                  <input
                    type="text"
                    defaultValue="Berlin"
                    className="font-body text-[13px] text-muted bg-transparent border-none focus:outline-none w-14"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                  <CheckCircle2 size={10} style={{ color: '#06D6A0' }} />
                  <span className="font-body text-[10px] font-medium" style={{ color: '#059669' }}>Verified</span>
                </div>
                <div className="px-2 py-0.5 rounded-full font-body text-[10px] font-medium"
                     style={{ backgroundColor: `${profileAccent}15`, color: profileAccent }}>
                  Editing {profileMode}
                </div>
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="mb-6">
            <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-2">Editing profile for</div>
            <div className="bg-surface rounded-full p-1 flex border border-warm relative">
              <div
                className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
                style={{
                  backgroundColor: profileAccent,
                  left: profileMode === 'social' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                  boxShadow: `0 6px 18px -4px ${profileAccent}88`
                }}
              />
              {[
                { key: 'social', label: 'Social', Icon: Heart },
                { key: 'work', label: 'Work', Icon: Briefcase }
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setProfileMode(key)}
                  className={`flex-1 py-2.5 rounded-full font-body text-[13px] font-medium z-10 transition-colors flex items-center justify-center gap-1.5 ${
                    profileMode === key ? 'text-white' : 'text-muted'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <div className="font-body text-[11px] text-faint mt-2 leading-relaxed">
              Switch modes to edit a different version of your profile. Each mode has its own answers, bio, hobbies, and favorites.
            </div>
          </div>

          {/* About me */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-body text-[11px] uppercase tracking-wider text-ink">About me</div>
              <div className="font-body text-[10px] text-faint">{bios[profileMode].length}/160</div>
            </div>
            <textarea
              defaultValue={bios[profileMode]}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[14px] text-ink leading-relaxed focus:outline-none border border-warm focus:border-ink transition-colors resize-none"
            />
          </div>

          {/* Hobbies */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} style={{ color: profileAccent }} />
              <div className="font-body text-[11px] uppercase tracking-wider text-ink">Hobbies & interests</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hobbies[profileMode].map((h, i) => (
                <div key={i}
                     className="px-3 py-1.5 rounded-full font-display italic text-[13px] flex items-center gap-1.5 group"
                     style={{
                       backgroundColor: `${profileAccent}12`,
                       color: profileAccent,
                       border: `1px solid ${profileAccent}25`
                     }}>
                  {h}
                  <button className="opacity-50 hover:opacity-100">
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              <button className="px-3 py-1.5 rounded-full font-body text-[12px] text-muted border border-dashed border-faint hover:border-ink hover:text-ink transition-colors">
                + Add
              </button>
            </div>
          </div>

          {/* Favorites */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <Heart size={12} style={{ color: profileAccent }} />
              <div className="font-body text-[11px] uppercase tracking-wider text-ink">Favorites</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {favorites[profileMode].map((f, i) => {
                const Icon = f.Icon;
                return (
                  <div key={i} className="bg-surface rounded-2xl p-3 border border-warm flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: `${profileAccent}15` }}>
                      <Icon size={14} style={{ color: profileAccent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-[10px] uppercase tracking-wider text-faint">{f.label}</div>
                      <input
                        type="text"
                        defaultValue={f.value}
                        className="font-display italic text-[14px] text-ink bg-transparent border-none focus:outline-none w-full truncate"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Three-question answers */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={12} style={{ color: profileAccent }} />
              <div className="font-body text-[11px] uppercase tracking-wider text-ink">Your three answers</div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-body text-[11px] text-muted mb-1.5">Talk to me about</div>
                <div className="space-y-1">
                  {answers[profileMode].talkAbout.map((t, i) => (
                    <input
                      key={i}
                      type="text"
                      defaultValue={t}
                      className="w-full px-3.5 py-2.5 bg-surface rounded-xl font-display italic text-[14px] text-ink focus:outline-none border border-warm focus:border-ink transition-colors"
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-body text-[11px] text-muted mb-1.5">Conversation starters</div>
                <div className="space-y-1">
                  {answers[profileMode].starters.map((s, i) => (
                    <input
                      key={i}
                      type="text"
                      defaultValue={s}
                      className="w-full px-3.5 py-2.5 bg-surface rounded-xl font-body text-[13.5px] text-ink focus:outline-none border border-warm focus:border-ink transition-colors"
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-body text-[11px] text-muted mb-1.5">Don\u2019t talk about</div>
                <div className="flex flex-wrap gap-1.5">
                  {answers[profileMode].dontTalk.map((d, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-full bg-surface border border-warm font-body text-[12.5px] text-muted flex items-center gap-1.5">
                      {d}
                      <button className="opacity-50 hover:opacity-100">
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                  <button className="px-3 py-1.5 rounded-full font-body text-[12px] text-muted border border-dashed border-faint hover:border-ink hover:text-ink transition-colors">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2 mb-4">
            {[
              { label: 'Visibility & privacy', sub: 'Who can see you, radius, ghost mode', action: () => setShowSettings(true) },
              { label: 'Notifications', sub: 'Hi\u2019s, plans, activity updates' },
              { label: 'Blocked users', sub: '0 people blocked' },
              { label: 'Help & safety center', sub: 'Report, guides, contact us' }
            ].map((item, i) => (
              <button key={i}
                      onClick={item.action}
                      className="w-full bg-surface rounded-2xl p-4 border border-warm flex items-center justify-between hover:border-ink transition-colors active:scale-[0.99]">
                <div className="text-left">
                  <div className="font-body font-medium text-[14px] text-ink">{item.label}</div>
                  <div className="font-body text-[12px] text-muted mt-0.5">{item.sub}</div>
                </div>
                <ChevronRight size={16} className="text-faint" />
              </button>
            ))}
          </div>

          {/* Preview button */}
          <button
            onClick={() => setScreen('preview')}
            className="w-full py-3.5 rounded-full font-body font-medium text-white text-[14px] flex items-center justify-center gap-2 mb-3"
            style={{
              backgroundColor: profileAccent,
              boxShadow: `0 10px 25px -8px ${profileAccent}cc`
            }}
          >
            <Sparkles size={14} />
            Preview how others see me
          </button>

          <button className="w-full py-3 font-body text-[13px] text-faint hover:text-muted transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  };

  const PreviewScreen = () => {
    const previewAccent = profileMode === 'work' ? '#4F46E5' : '#FF2D87';

    const hobbies = {
      social: ['bookbinding', 'cold-water swimming', 'vintage cameras', 'natural wine', 'hiking', 'ceramics'],
      work: ['design systems', 'founder coaching', 'type design', 'prototyping', 'user research']
    };

    const favorites = {
      social: [
        { Icon: BookOpen, label: 'Book', value: 'A Little Life' },
        { Icon: Film, label: 'Film', value: 'In the Mood for Love' },
        { Icon: Music, label: 'Artist', value: 'Mk.gee' },
        { Icon: Plane, label: 'City', value: 'Lisbon' }
      ],
      work: [
        { Icon: BookOpen, label: 'Book', value: 'Shape Up by Basecamp' },
        { Icon: Film, label: 'Doc', value: 'General Magic' },
        { Icon: Music, label: 'Podcast', value: 'Dithering' },
        { Icon: Plane, label: 'Conf', value: 'Config' }
      ]
    };

    const bios = {
      social: 'Designer in Berlin, ex-NYC. I\u2019m most awake around sunrise, worst at small talk, best at long walks.',
      work: 'Senior product designer. Leading design for a Series B developer tools startup. Open to advising.'
    };

    const answers = {
      social: {
        talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
        starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
        dontTalk: ['my ex', 'politics']
      },
      work: {
        talkAbout: ['design systems at scale', 'hiring your first designer', 'PM\u2194design friction'],
        starters: ['What are you building?', 'How\u2019s your team structured?', 'Biggest design debt you\u2019re carrying?'],
        dontTalk: ['compensation', 'my old company']
      }
    };

    return (
      <div className="h-full flex flex-col bg-cream relative">
        {/* Preview banner */}
        <div className="px-4 pt-10 pb-2">
          <div className="rounded-2xl px-4 py-2.5 flex items-center justify-between"
               style={{
                 background: `linear-gradient(135deg, ${previewAccent}18 0%, ${previewAccent}08 100%)`,
                 border: `1px solid ${previewAccent}40`
               }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: previewAccent }}>
                <Sparkles size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-body text-[12px] font-medium" style={{ color: previewAccent }}>
                  Preview \u2014 your {profileMode} profile
                </div>
                <div className="font-body text-[10px]" style={{ color: previewAccent, opacity: 0.7 }}>
                  This is what others see
                </div>
              </div>
            </div>
            <button onClick={() => setScreen('profile')} className="p-1">
              <X size={16} style={{ color: previewAccent }} />
            </button>
          </div>
        </div>

        {/* Faux distance tag (matches PersonScreen layout) */}
        <div className="px-6 pt-2 pb-3 flex items-center justify-between">
          <button onClick={() => setScreen('profile')} className="text-ink opacity-40">
            <ArrowLeft size={20} />
          </button>
          <div className="font-body text-[11px] uppercase tracking-wider" style={{ color: '#A8A3B8' }}>
            in this venue
          </div>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10">
          {/* Header with photo */}
          <div className="flex items-center gap-4 mb-5">
            {photoUploaded ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-display italic text-white text-[34px]"
                   style={{
                     background: `linear-gradient(135deg, ${previewAccent} 0%, #FF8A00 50%, #F43F5E 100%)`,
                     boxShadow: `0 14px 35px -8px ${previewAccent}aa`
                   }}>
                M
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-body font-medium text-white text-[22px]"
                   style={{
                     backgroundColor: previewAccent,
                     boxShadow: `0 14px 35px -8px ${previewAccent}aa`
                   }}>
                ML
              </div>
            )}
            <div>
              <div className="font-display text-[26px] text-ink leading-tight">Morgan L., 29</div>
              <div className="flex items-center gap-1.5 mt-1">
                {profileMode === 'work' ? <Briefcase size={11} className="text-muted" /> : <Heart size={11} className="text-muted" />}
                <span className="font-body text-[11px] uppercase tracking-wider text-muted">
                  {profileMode} mode
                </span>
                <div className="w-0.5 h-3 rounded-full bg-faint" />
                <MapPin size={10} className="text-muted" />
                <span className="font-body text-[11px] text-muted">Berlin</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full w-fit"
                   style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)' }}>
                <CheckCircle2 size={9} style={{ color: '#06D6A0' }} />
                <span className="font-body text-[9px] font-medium" style={{ color: '#059669' }}>Verified</span>
              </div>
            </div>
          </div>

          <p className="font-body text-[14px] text-ink leading-relaxed mb-6 italic">
            \u201c{bios[profileMode]}\u201d
          </p>

          <div className="space-y-5">
            {/* Talk about */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles size={12} style={{ color: previewAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Talk to me about</div>
              </div>
              <div className="space-y-1.5">
                {answers[profileMode].talkAbout.map((t, i) => (
                  <div key={i} className="font-display italic text-[18px] text-ink leading-snug">{t}</div>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div className="border-t border-warm pt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Heart size={12} style={{ color: previewAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Hobbies & interests</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hobbies[profileMode].map((h, i) => (
                  <div key={i}
                       className="px-3 py-1.5 rounded-full font-display italic text-[13px]"
                       style={{
                         backgroundColor: `${previewAccent}12`,
                         color: previewAccent,
                         border: `1px solid ${previewAccent}25`
                       }}>
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <div className="border-t border-warm pt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles size={12} style={{ color: previewAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Favorites</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {favorites[profileMode].map((f, i) => {
                  const Icon = f.Icon;
                  return (
                    <div key={i} className="bg-surface rounded-2xl p-3 border border-warm flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: `${previewAccent}15` }}>
                        <Icon size={14} style={{ color: previewAccent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-[10px] uppercase tracking-wider text-faint">{f.label}</div>
                        <div className="font-display italic text-[14px] text-ink truncate">{f.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conversation starters */}
            <div className="border-t border-warm pt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <MessageSquare size={12} style={{ color: previewAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Conversation starters</div>
              </div>
              <div className="space-y-2">
                {answers[profileMode].starters.map((s, i) => (
                  <div key={i} className="bg-surface border border-warm rounded-xl px-3.5 py-2.5">
                    <div className="font-body text-[13.5px] text-ink leading-snug">{s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Don't talk about */}
            <div className="border-t border-warm pt-5 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={12} className="text-faint" />
                <div className="font-body text-[11px] uppercase tracking-wider text-faint">Don\u2019t talk about</div>
              </div>
              <div className="font-body text-[13px] text-faint">
                {answers[profileMode].dontTalk.join(' \u00b7 ')}
              </div>
            </div>
          </div>

          {/* Faux action bar (dimmed to show they exist for others) */}
          <div className="mt-8 pt-5 border-t border-warm">
            <div className="font-body text-[11px] uppercase tracking-wider text-faint mb-3 text-center">
              What others see at the bottom
            </div>
            <div className="space-y-2 opacity-60 pointer-events-none">
              <div className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2"
                   style={{ backgroundColor: previewAccent }}>
                <Sparkles size={15} />
                Say Hi
              </div>
              <div className="flex gap-2">
                <div className="flex-1 py-3 rounded-full font-body font-medium text-ink text-[14px] bg-surface border border-warm text-center">
                  Make Plans
                </div>
                <div className="px-5 py-3 rounded-full font-body text-muted text-[14px]">
                  Not interested
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action: back to editing */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4 bg-gradient-to-t from-cream via-cream to-transparent">
          <button
            onClick={() => setScreen('profile')}
            className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#12101C',
              boxShadow: '0 12px 30px -10px rgba(18,16,28,0.5)'
            }}
          >
            <Pencil size={14} />
            Back to editing
          </button>
        </div>
      </div>
    );
  };

  const SettingsDrawer = () => (
    <div className={`absolute inset-0 z-30 transition-opacity duration-300 ${showSettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(18, 16, 28, 0.45)' }} onClick={() => setShowSettings(false)} />
      <div className={`absolute bottom-0 left-0 right-0 bg-cream rounded-t-3xl p-6 transition-transform duration-300 ease-out ${showSettings ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-10 h-1 rounded-full bg-faint mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <div className="font-display text-[22px] text-ink">Visibility</div>
          <button onClick={() => setShowSettings(false)} className="text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-2">Your radius</div>
            <div className="bg-surface rounded-2xl p-1 flex border border-warm">
              {[
                { key: 'room', label: 'This room', sub: '~10m' },
                { key: 'venue', label: 'This venue', sub: '~100m' },
                { key: 'area', label: 'This area', sub: '~1km' }
              ].map(r => (
                <button
                  key={r.key}
                  onClick={() => setRadius(r.key)}
                  className={`flex-1 py-2.5 rounded-xl transition-colors ${radius === r.key ? 'bg-cream' : ''}`}
                >
                  <div className={`font-body text-[12.5px] font-medium ${radius === r.key ? 'text-ink' : 'text-muted'}`}>
                    {r.label}
                  </div>
                  <div className="font-body text-[10px] text-faint">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-warm flex items-center justify-between">
            <div>
              <div className="font-body text-[14px] font-medium text-ink">Auto-disappear</div>
              <div className="font-body text-[12px] text-muted">After 2 hours of inactivity</div>
            </div>
            <div className="w-10 h-6 rounded-full relative flex-shrink-0" style={{ backgroundColor: '#12101C' }}>
              <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-cream" />
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-warm flex items-center justify-between">
            <div>
              <div className="font-body text-[14px] font-medium text-ink">Show me on the list</div>
              <div className="font-body text-[12px] text-muted">{visible ? 'Visible to nearby users' : 'Invisible'}</div>
            </div>
            <button
              onClick={() => setVisible(!visible)}
              className="w-10 h-6 rounded-full relative flex-shrink-0 transition-colors"
              style={{ backgroundColor: visible ? '#12101C' : '#A8A3B8' }}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-cream transition-all ${visible ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="font-body text-[11.5px] text-muted leading-relaxed pt-1">
            We never show your location on a map. Other users only see <em className="font-display not-italic">that</em> you\u2019re near \u2014 never <em className="font-display not-italic">where</em>.
          </div>
        </div>

        <button
          onClick={() => setShowSettings(false)}
          className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] mt-6"
          style={{ backgroundColor: '#12101C' }}
        >
          Done
        </button>
      </div>
    </div>
  );

  const BottomNav = () => {
    const tabs = [
      { key: 'discover', Icon: Users, label: 'Discover', badge: 0 },
      { key: 'connections', Icon: MessageSquare, label: 'Connections', badge: pendingReceived },
      { key: 'activity', Icon: Bell, label: 'Activity', badge: recentActivity > 0 ? '\u2022' : 0 },
      { key: 'profile', Icon: User, label: 'Profile', badge: 0 }
    ];

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-cream border-t border-warm px-6 py-3 flex justify-around z-20">
        {tabs.map(({ key, Icon, label, badge }) => {
          const isActive = screen === key;
          const tabColor = isActive ? accentColor : '#A8A3B8';
          return (
            <button
              key={key}
              onClick={() => setScreen(key)}
              className="flex flex-col items-center gap-0.5 py-1 relative transition-transform active:scale-95"
            >
              <div className="relative">
                <Icon size={19} style={{ color: tabColor }} strokeWidth={isActive ? 2.5 : 2} />
                {badge ? (
                  <div className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1"
                       style={{ backgroundColor: '#FF2D87', boxShadow: '0 2px 6px -1px rgba(255, 45, 135, 0.5)' }}>
                    <div className="text-white font-body text-[9px] font-bold leading-none">
                      {typeof badge === 'number' ? badge : ''}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="font-body text-[10px] font-medium" style={{ color: isActive ? '#12101C' : '#A8A3B8' }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ============ MAIN LAYOUT ============

  const showNav = ['discover', 'connections', 'activity', 'profile'].includes(screen);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6"
         style={{
           background: 'linear-gradient(135deg, #FFE4F0 0%, #F4F1FF 50%, #DBF4FF 100%)',
           fontFamily: 'Geist, sans-serif'
         }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Geist:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body { font-family: 'Geist', system-ui, sans-serif; }
        .bg-cream { background-color: #FAFAFB; }
        .bg-surface { background-color: #FFFFFF; }
        .text-ink { color: #12101C; }
        .text-muted { color: #4A4458; }
        .text-faint { color: #A8A3B8; }
        .border-warm { border-color: #EEEBF2; }
        .divide-warm > * + * { border-color: #EEEBF2; }
        .bg-faint { background-color: #A8A3B8; }
      `}</style>

      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl">
        <div className="hidden lg:block max-w-[280px]">
          <div className="font-display italic text-[13px] mb-3" style={{ color: '#12101C', opacity: 0.6 }}>
            interactive prototype
          </div>
          <h2 className="font-display text-[34px] leading-[1.1] mb-4" style={{ color: '#12101C' }}>
            Proximity \u2014 the social handshake for shared spaces.
          </h2>
          <p className="font-body text-[13.5px] leading-relaxed" style={{ color: '#4A4458' }}>
            Tap through six live screens. Toggle modes, open a profile, send a Hi, browse Connections and Activity, and edit your full profile \u2014 photo, bio, hobbies, favorites.
          </p>
          <div className="mt-6 space-y-2 font-body text-[12px]" style={{ color: '#4A4458' }}>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF2D87' }} /> Social mode \u2014 electric magenta</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4F46E5' }} /> Work mode \u2014 cobalt violet</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D9F65C', boxShadow: '0 0 6px #D9F65C' }} /> Live "in this room" indicator</div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-[52px] -m-1.5"
               style={{ background: 'linear-gradient(145deg, #18161F, #2D2A3D)' }} />
          <div
            className="relative rounded-[44px] overflow-hidden bg-cream"
            style={{
              width: '380px',
              height: '780px',
              boxShadow: '0 40px 100px -20px rgba(18,16,28,0.45), 0 15px 35px -10px rgba(18,16,28,0.25)'
            }}
          >
            <div className="relative h-full">
              {screen === 'welcome' && <WelcomeScreen />}
              {screen === 'setup' && <SetupScreen />}
              {screen === 'discover' && <DiscoverScreen />}
              {screen === 'person' && <PersonScreen />}
              {screen === 'connections' && <ConnectionsScreen />}
              {screen === 'activity' && <ActivityScreen />}
              {screen === 'profile' && <ProfileScreen />}
              {screen === 'preview' && <PreviewScreen />}
              {showNav && <BottomNav />}
              <SettingsDrawer />
            </div>
          </div>

          <div className="lg:hidden text-center mt-6 max-w-[340px] mx-auto">
            <div className="font-display italic text-[12px] mb-1" style={{ color: '#4A4458' }}>
              interactive prototype
            </div>
            <div className="font-body text-[12px]" style={{ color: '#4A4458' }}>
              Tap through. Toggle modes. Try every tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
