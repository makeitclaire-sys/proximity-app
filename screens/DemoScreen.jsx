import { useState } from 'react';
import {
  ArrowLeft, Settings, X, Check, Users, MessageSquare,
  Sparkles, EyeOff, Briefcase, Heart, Bell, Clock,
  CheckCircle2, MapPin, UserPlus, Send, Camera, User,
  ChevronRight, Pencil, Phone, Shield, HandMetal, Zap
} from 'lucide-react';

export default function Demoscreen() {
  const [screen, setScreen] = useState('welcome');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [mode, setMode] = useState('social');
  const [actionTaken, setActionTaken] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [radius, setRadius] = useState('venue');
  const [visible, setVisible] = useState(true);
  const [profileMode, setProfileMode] = useState('social');
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // Signup flow state
  const [signupStep, setSignupStep] = useState('phone'); // phone, code, username, birthday, selfie, pick-mode, basics, done
  const [signupMode, setSignupMode] = useState(null); // 'social' | 'professional' — which profile they're setting up
  const [selfieState, setSelfieState] = useState('intro'); // intro, scanning, verified
  const [hasSocialProfile, setHasSocialProfile] = useState(false);
  const [hasProProfile, setHasProProfile] = useState(false);

  // ============ DATA ============

  const allPeople = [
    {
      id: 1, name: 'Maya R.', age: 28, mode: 'social',
      distance: 'in this room', distanceCategory: 'room',
      accent: '#FF2D87', initials: 'MR',
      status: 'New in Berlin',
      affiliation: 'Figma \u00b7 ex-NYC',
      bio: 'Designer, ex-NYC, figuring out Berlin.',
      talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
      starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
      dontTalk: ['my ex', 'politics']
    },
    {
      id: 2, name: 'Daniel K.', age: 34, mode: 'professional',
      distance: 'in this venue', distanceCategory: 'venue',
      accent: '#4F46E5', initials: 'DK',
      status: 'Founder, seed-stage',
      affiliation: 'Linear alum \u00b7 building dev tools',
      bio: 'Building a dev tools startup. Looking for design feedback.',
      talkAbout: ['dev tooling', 'B2B pricing', 'running a tiny team'],
      starters: ['What are you building?', 'Favorite engineering blog?', 'Mac or Linux?'],
      dontTalk: ['compensation', 'crypto']
    },
    {
      id: 3, name: 'Priya S.', age: 26, mode: 'social',
      distance: '12m away', distanceCategory: 'venue',
      accent: '#FF8A00', initials: 'PS',
      status: 'PhD, new in town',
      affiliation: 'Humboldt University',
      bio: 'PhD candidate in cognitive science. New in town.',
      talkAbout: ['weird brain stuff', 'vintage cameras', 'good dosa spots'],
      starters: ['Reading anything good?', 'Favorite museum here?', 'Coffee shop recs?'],
      dontTalk: ['academia gossip']
    },
    {
      id: 4, name: 'Marco T.', age: 31, mode: 'professional',
      distance: 'in this venue', distanceCategory: 'venue',
      accent: '#A855F7', initials: 'MT',
      status: 'Product lead',
      affiliation: 'N26 \u00b7 fintech',
      bio: 'Product lead at a fintech. Here for the AI track.',
      talkAbout: ['LLM evals', 'PM career paths', 'Italy'],
      starters: ['What talk are you most excited for?', 'Where\u2019d you fly in from?', 'Specialty coffee?'],
      dontTalk: ['my old company']
    },
    {
      id: 5, name: 'Aisha O.', age: 29, mode: 'social',
      distance: 'in this room', distanceCategory: 'room',
      accent: '#06D6A0', initials: 'AO',
      status: 'Writing my first novel',
      affiliation: 'freelance journalist',
      bio: 'Writing my first novel. Here for the quiet wifi.',
      talkAbout: ['speculative fiction', 'tarot', 'cold-water swimming'],
      starters: ['What are you working on?', 'Last film that wrecked you?', 'Tea order?'],
      dontTalk: ['publishing industry']
    },
    {
      id: 6, name: 'Jonas W.', age: 36, mode: 'professional',
      distance: 'nearby', distanceCategory: 'area',
      accent: '#F43F5E', initials: 'JW',
      status: 'CTO, hiring',
      affiliation: 'Climeworks',
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
  const accentColor = mode === 'professional' ? '#4F46E5' : '#FF2D87';

  // Mode-specific action button labels
  const getActions = (m) => m === 'professional'
    ? { primary: 'Let\u2019s connect', secondary: 'Tap me in', tertiary: 'Not interested', primaryIcon: HandMetal, secondaryIcon: Zap }
    : { primary: 'Come say hi', secondary: 'Let\u2019s chat', tertiary: 'Not interested', primaryIcon: Sparkles, secondaryIcon: MessageSquare };

  // ============ SCREENS ============

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
            onClick={() => { setSignupStep('phone'); setScreen('signup'); }}
            className="w-full py-4 rounded-full font-body font-medium text-white text-[15px] transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#12101C', boxShadow: '0 12px 30px -10px rgba(18,16,28,0.5)' }}
          >
            Create your account
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

  // =========================================================
  // SIGNUP FLOW — clean, multi-step, like top social platforms
  // =========================================================

  const SignupScreen = () => {
    const stepOrder = ['phone', 'code', 'username', 'birthday', 'selfie', 'pick-mode', 'basics', 'done'];
    const stepIndex = stepOrder.indexOf(signupStep);
    const totalSteps = stepOrder.length - 1; // exclude 'done'

    const goNext = () => {
      const next = stepOrder[stepIndex + 1];
      if (next) setSignupStep(next);
    };
    const goBack = () => {
      if (stepIndex === 0) { setScreen('welcome'); return; }
      setSignupStep(stepOrder[stepIndex - 1]);
    };

    const stepAccent = signupMode === 'professional' ? '#4F46E5' : '#FF2D87';

    return (
      <div className="h-full flex flex-col bg-cream">
        {/* Top bar with back + progress */}
        {signupStep !== 'done' && (
          <div className="px-6 pt-12 pb-4 flex items-center gap-3">
            <button onClick={goBack} className="text-ink flex-shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 h-1 bg-warm rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 ease-out rounded-full"
                   style={{
                     width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                     backgroundColor: stepAccent
                   }} />
            </div>
            <div className="font-body text-[11px] text-faint tracking-wider w-10 text-right">
              {stepIndex + 1}/{totalSteps}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {signupStep === 'phone' && (
            <div className="pt-6 space-y-6">
              <div>
                <h2 className="font-display text-[32px] leading-tight text-ink">
                  What\u2019s your number?
                </h2>
                <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
                  We\u2019ll text you a code. Your number is never shown to other users.
                </p>
              </div>
              <div className="bg-surface rounded-2xl border border-warm overflow-hidden">
                <div className="flex items-center">
                  <div className="px-4 py-4 border-r border-warm font-body text-[15px] text-ink">
                    +1
                  </div>
                  <input
                    type="tel"
                    defaultValue="555 012 3847"
                    className="flex-1 px-4 py-4 font-body text-[17px] text-ink bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
                style={{ backgroundColor: '#12101C' }}
              >
                Send code
              </button>
              <p className="font-body text-[11px] text-faint text-center leading-relaxed">
                By continuing, you agree to our Terms and Privacy Policy. Standard message rates may apply.
              </p>
            </div>
          )}

          {signupStep === 'code' && (
            <div className="pt-6 space-y-6">
              <div>
                <h2 className="font-display text-[32px] leading-tight text-ink">
                  Enter the code
                </h2>
                <p className="font-body text-[13px] text-muted mt-2">
                  Sent to +1 (555) 012\u20113847
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                {['4', '7', '2', '9', '0', '1'].map((digit, i) => (
                  <div key={i}
                       className="w-11 h-14 rounded-xl bg-surface border-2 flex items-center justify-center font-display text-[24px] text-ink"
                       style={{ borderColor: i < 6 ? '#12101C' : '#EEEBF2' }}>
                    {digit}
                  </div>
                ))}
              </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
                style={{ backgroundColor: '#12101C' }}
              >
                Continue
              </button>
              <button className="w-full py-2 font-body text-[13px] text-muted underline-offset-4 hover:underline">
                Resend code
              </button>
            </div>
          )}

          {signupStep === 'username' && (
            <div className="pt-6 space-y-6">
              <div>
                <h2 className="font-display text-[32px] leading-tight text-ink">
                  Pick a username
                </h2>
                <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
                  This is how other people will find you. You can change it once.
                </p>
              </div>
              <div className="bg-surface rounded-2xl border border-warm overflow-hidden">
                <div className="flex items-center">
                  <div className="px-4 py-4 font-display italic text-[17px] text-faint">
                    @
                  </div>
                  <input
                    type="text"
                    defaultValue="morgan.l"
                    className="flex-1 px-1 py-4 font-body text-[17px] text-ink bg-transparent focus:outline-none"
                  />
                  <div className="pr-4">
                    <Check size={18} style={{ color: '#06D6A0' }} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={12} style={{ color: '#06D6A0' }} strokeWidth={2.5} />
                <span className="font-body text-[12px] text-muted">Available</span>
              </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
                style={{ backgroundColor: '#12101C' }}
              >
                Continue
              </button>
            </div>
          )}

          {signupStep === 'birthday' && (
            <div className="pt-6 space-y-6">
              <div>
                <h2 className="font-display text-[32px] leading-tight text-ink">
                  When\u2019s your birthday?
                </h2>
                <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
                  You must be 18 or older to use Proximity. Your age shows; your exact date doesn\u2019t unless you want.
                </p>
              </div>
              <div className="flex gap-2">
                {[
                  { label: 'Month', value: 'March' },
                  { label: 'Day', value: '14' },
                  { label: 'Year', value: '1996' }
                ].map((f, i) => (
                  <div key={i} className="flex-1 bg-surface rounded-2xl border border-warm overflow-hidden">
                    <div className="px-3 pt-2 font-body text-[10px] uppercase tracking-wider text-faint">
                      {f.label}
                    </div>
                    <input
                      type="text"
                      defaultValue={f.value}
                      className="w-full px-3 pb-3 font-body text-[15px] text-ink bg-transparent focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
                style={{ backgroundColor: '#12101C' }}
              >
                Continue
              </button>
            </div>
          )}

          {signupStep === 'selfie' && <SelfieVerifyStep onDone={goNext} />}

          {signupStep === 'pick-mode' && (
            <div className="pt-6 space-y-5">
              <div>
                <h2 className="font-display text-[32px] leading-tight text-ink">
                  What are you here for?
                </h2>
                <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
                  Set up one profile now. You can add the other later from your account.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { setSignupMode('social'); goNext(); }}
                  className="w-full bg-surface rounded-2xl p-5 border-2 text-left relative overflow-hidden hover:border-ink transition-colors active:scale-[0.99]"
                  style={{ borderColor: signupMode === 'social' ? '#FF2D87' : '#EEEBF2' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: 'rgba(255, 45, 135, 0.12)' }}>
                      <Heart size={22} style={{ color: '#FF2D87' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[20px] text-ink leading-tight">Social</div>
                      <div className="font-body text-[13px] text-muted mt-1 leading-snug">
                        Meet friends, travel buddies, the people at your caf\u00e9 or event.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setSignupMode('professional'); goNext(); }}
                  className="w-full bg-surface rounded-2xl p-5 border-2 text-left relative overflow-hidden hover:border-ink transition-colors active:scale-[0.99]"
                  style={{ borderColor: signupMode === 'professional' ? '#4F46E5' : '#EEEBF2' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: 'rgba(79, 70, 229, 0.12)' }}>
                      <Briefcase size={22} style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[20px] text-ink leading-tight">Professional</div>
                      <div className="font-body text-[13px] text-muted mt-1 leading-snug">
                        Network at conferences, find collaborators, build your circle.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {signupStep === 'basics' && signupMode && (
            <div className="pt-6 space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                     style={{ backgroundColor: `${stepAccent}15` }}>
                  {signupMode === 'professional' ? (
                    <Briefcase size={11} style={{ color: stepAccent }} />
                  ) : (
                    <Heart size={11} style={{ color: stepAccent }} />
                  )}
                  <span className="font-body text-[11px] font-medium uppercase tracking-wider" style={{ color: stepAccent }}>
                    {signupMode} profile
                  </span>
                </div>
                <h2 className="font-display text-[30px] leading-tight text-ink">
                  Tell us a little<br/>about yourself.
                </h2>
                <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
                  You can edit any of this later.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-1.5">Status</div>
                  <input
                    type="text"
                    placeholder={signupMode === 'professional' ? 'e.g. Founder, seed-stage' : 'e.g. New in town'}
                    defaultValue={signupMode === 'professional' ? 'Senior product designer' : 'Most at home at sunrise'}
                    className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[15px] text-ink border border-warm focus:border-ink focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-1.5">
                    {signupMode === 'professional' ? 'Where you work' : 'Notable affiliation'}
                  </div>
                  <input
                    type="text"
                    placeholder={signupMode === 'professional' ? 'Company, role' : 'School, team, community, church'}
                    defaultValue={signupMode === 'professional' ? 'Series B dev tools startup' : 'Berlin \u00b7 ex-NYC'}
                    className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[15px] text-ink border border-warm focus:border-ink focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-body text-[11px] uppercase tracking-wider text-ink">Bio</div>
                    <div className="font-body text-[10px] text-faint">up to 160</div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="What should people know about you?"
                    defaultValue={signupMode === 'professional'
                      ? 'Leading design at a dev tools startup. Open to advising and the occasional coffee.'
                      : 'Designer in Berlin, ex-NYC. Sunrise person, long walker, bad at small talk.'}
                    maxLength={160}
                    className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[14px] text-ink leading-relaxed border border-warm focus:border-ink focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (signupMode === 'social') setHasSocialProfile(true);
                  if (signupMode === 'professional') setHasProProfile(true);
                  goNext();
                }}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px] mt-2"
                style={{ backgroundColor: stepAccent, boxShadow: `0 10px 25px -8px ${stepAccent}aa` }}
              >
                Finish my {signupMode} profile
              </button>
            </div>
          )}

          {signupStep === 'done' && <SignupDoneStep />}
        </div>
      </div>
    );
  };

  const SelfieVerifyStep = ({ onDone }) => {
    return (
      <div className="pt-4 space-y-5">
        <div>
          <h2 className="font-display text-[30px] leading-tight text-ink">
            One quick selfie.
          </h2>
          <p className="font-body text-[13px] text-muted mt-2 leading-relaxed">
            Everyone on Proximity is verified. It takes five seconds and stops bots and fake profiles in their tracks.
          </p>
        </div>

        {selfieState === 'intro' && (
          <>
            <div className="relative aspect-square rounded-3xl overflow-hidden"
                 style={{
                   background: 'linear-gradient(145deg, #F4F1FF 0%, #FFE4F0 100%)',
                   border: '1px dashed #CFC9D9'
                 }}>
              <div className="absolute inset-6 rounded-full border-2 border-dashed flex items-center justify-center"
                   style={{ borderColor: '#CFC9D9' }}>
                <User size={60} className="text-faint" strokeWidth={1} />
              </div>
              <div className="absolute top-4 left-4 right-4 flex items-center gap-1.5">
                <Shield size={11} className="text-muted" />
                <span className="font-body text-[10px] uppercase tracking-wider text-muted">
                  Private \u00b7 never shown to others
                </span>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#06D6A0' }} />
                <div className="font-body text-[13px] text-muted leading-relaxed">Confirms you\u2019re a real human</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#06D6A0' }} />
                <div className="font-body text-[13px] text-muted leading-relaxed">Gets you a Verified badge on your profile</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#06D6A0' }} />
                <div className="font-body text-[13px] text-muted leading-relaxed">Never visible to other users, never sold</div>
              </div>
            </div>
            <button
              onClick={() => setSelfieState('scanning')}
              className="w-full py-4 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2"
              style={{ backgroundColor: '#12101C' }}
            >
              <Camera size={16} />
              Take selfie
            </button>
          </>
        )}

        {selfieState === 'scanning' && (
          <>
            <div className="relative aspect-square rounded-3xl overflow-hidden"
                 style={{ background: 'linear-gradient(145deg, #2D2A3D, #18161F)' }}>
              <div className="absolute inset-8 rounded-full border-2 flex items-center justify-center"
                   style={{ borderColor: 'rgba(255, 45, 135, 0.6)' }}>
                <div className="absolute inset-0 rounded-full animate-ping"
                     style={{ border: '2px solid rgba(255, 45, 135, 0.4)' }} />
                <User size={60} className="text-white opacity-40" strokeWidth={1} />
              </div>
              <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: '#FF2D87' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FF2D87' }} />
                </div>
                <span className="font-body text-[12px] text-white">Analyzing\u2026</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setSelfieState('verified')}
                className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
                style={{ backgroundColor: '#12101C' }}
              >
                Simulate verify \u2014 tap
              </button>
            </div>
          </>
        )}

        {selfieState === 'verified' && (
          <>
            <div className="relative aspect-square rounded-3xl overflow-hidden flex items-center justify-center"
                 style={{ background: 'linear-gradient(145deg, rgba(6, 214, 160, 0.15), rgba(217, 246, 92, 0.2))' }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: '#06D6A0', boxShadow: '0 16px 40px -10px rgba(6, 214, 160, 0.6)' }}>
                <Check size={44} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="text-center space-y-1 pt-1">
              <div className="font-display text-[24px] text-ink leading-tight">You\u2019re verified.</div>
              <div className="font-body text-[13px] text-muted">That badge shows up on every profile you create.</div>
            </div>
            <button
              onClick={() => { setSelfieState('intro'); onDone(); }}
              className="w-full py-4 rounded-full font-body font-medium text-white text-[15px]"
              style={{ backgroundColor: '#12101C' }}
            >
              Continue
            </button>
          </>
        )}
      </div>
    );
  };

  const SignupDoneStep = () => {
    const completedMode = signupMode;
    const otherMode = completedMode === 'social' ? 'professional' : 'social';
    const completedAccent = completedMode === 'professional' ? '#4F46E5' : '#FF2D87';
    const otherAccent = otherMode === 'professional' ? '#4F46E5' : '#FF2D87';

    return (
      <div className="pt-10 space-y-6 text-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full"
               style={{
                 background: `linear-gradient(135deg, ${completedAccent} 0%, #FF8A00 50%, #F43F5E 100%)`,
                 boxShadow: `0 16px 40px -10px ${completedAccent}99`
               }} />
          <div className="absolute inset-0 flex items-center justify-center font-display italic text-white text-[36px]">
            M
          </div>
        </div>

        <div>
          <h2 className="font-display text-[32px] leading-tight text-ink">
            You\u2019re in.
          </h2>
          <p className="font-body text-[13px] text-muted mt-2 leading-relaxed max-w-[260px] mx-auto">
            Your {completedMode} profile is live. Want to set up your {otherMode} profile too?
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-warm text-left"
             style={{ borderColor: `${otherAccent}40` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: `${otherAccent}15` }}>
              {otherMode === 'professional' ? (
                <Briefcase size={18} style={{ color: otherAccent }} />
              ) : (
                <Heart size={18} style={{ color: otherAccent }} />
              )}
            </div>
            <div className="flex-1">
              <div className="font-body font-medium text-[14px] text-ink capitalize">
                Add your {otherMode} profile
              </div>
              <div className="font-body text-[12px] text-muted mt-0.5 leading-snug">
                Different answers, different crowd, same account. Do it now or later from settings.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              setSignupMode(otherMode);
              setSignupStep('basics');
            }}
            className="w-full py-3.5 rounded-full font-body font-medium text-white text-[14px]"
            style={{ backgroundColor: otherAccent, boxShadow: `0 10px 25px -8px ${otherAccent}aa` }}
          >
            Set up my {otherMode} profile
          </button>
          <button
            onClick={() => { setMode(completedMode); setScreen('discover'); }}
            className="w-full py-3 font-body text-[14px] text-ink"
          >
            Maybe later \u2014 take me to Proximity
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // DISCOVER
  // =========================================================

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
              { key: 'professional', label: 'Pro', Icon: Briefcase }
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
                Visible to nearby \u00b7 {visiblePeople.length} people in {mode === 'professional' ? 'pro' : mode} mode
              </div>
            </>
          ) : (
            <div className="font-body text-[12px] text-muted">
              You\u2019re invisible. Tap Social or Pro to be discoverable.
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
                          <div className="font-display italic text-[12.5px] text-muted mt-0.5 truncate">
                            {person.status} \u00b7 {person.affiliation}
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

  // =========================================================
  // PERSON DETAIL
  // =========================================================

  const PersonScreen = () => {
    if (!selectedPerson) return null;
    const p = selectedPerson;
    const actions = getActions(p.mode);
    const PrimaryIcon = actions.primaryIcon;
    const SecondaryIcon = actions.secondaryIcon;

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
            <div className="flex-1 min-w-0">
              <div className="font-display text-[26px] text-ink leading-tight">{p.name}, {p.age}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {p.mode === 'professional' ? <Briefcase size={11} className="text-muted" /> : <Heart size={11} className="text-muted" />}
                <span className="font-body text-[11px] uppercase tracking-wider text-muted">
                  {p.mode === 'professional' ? 'pro' : p.mode} mode
                </span>
                <div className="w-0.5 h-3 rounded-full bg-faint" />
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)' }}>
                  <Check size={8} style={{ color: '#06D6A0' }} strokeWidth={3} />
                  <span className="font-body text-[9px] font-medium" style={{ color: '#059669' }}>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status + affiliation */}
          <div className="bg-surface rounded-2xl p-3.5 border border-warm mb-5">
            <div className="font-display italic text-[15px] text-ink leading-snug">{p.status}</div>
            <div className="font-body text-[12px] text-muted mt-1 flex items-center gap-1.5">
              <Briefcase size={10} className="text-faint" />
              {p.affiliation}
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
              onClick={() => { setActionTaken('primary'); }}
              className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: p.accent,
                boxShadow: `0 12px 30px -8px ${p.accent}cc`
              }}
            >
              <PrimaryIcon size={15} />
              {actions.primary}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { setActionTaken('secondary'); }}
                className="flex-1 py-3 rounded-full font-body font-medium text-ink text-[14px] bg-surface border border-warm transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <SecondaryIcon size={13} />
                {actions.secondary}
              </button>
              <button
                onClick={() => setScreen('discover')}
                className="px-5 py-3 rounded-full font-body text-muted text-[14px] hover:text-ink transition-colors"
              >
                {actions.tertiary}
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
                {actionTaken === 'primary' ? `${actions.primary}\u2009\u2014 sent.` : `${actions.secondary}\u2009\u2014 sent.`}
              </div>
              <div className="font-body text-[13px] text-muted leading-relaxed mb-5">
                {`We\u2019ll let you know when ${p.name.split(' ')[0]} responds. They won\u2019t see your interest if they pass.`}
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

  // =========================================================
  // CONNECTIONS
  // =========================================================

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
                  Reached out to you
                </div>
              </div>
              <div className="space-y-2.5">
                {received.map(c => {
                  const p = findPerson(c.personId);
                  const act = getActions(p.mode);
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
                            {p.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedPerson(p); setActionTaken(null); setScreen('person'); }}
                          className="flex-1 py-2.5 rounded-full font-body font-medium text-white text-[13px]"
                          style={{ backgroundColor: p.accent, boxShadow: `0 6px 16px -6px ${p.accent}cc` }}
                        >
                          {act.primary} back
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
                  const act = getActions(p.mode);
                  return (
                    <div key={c.personId}
                         className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-warm">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-body font-medium text-white text-[12px] opacity-70 flex-shrink-0"
                           style={{ backgroundColor: p.accent }}>
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-[13px] text-muted">
                          {act.primary} sent to <span className="text-ink font-medium">{p.name}</span>
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

  // =========================================================
  // ACTIVITY
  // =========================================================

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
        received: { Icon: Sparkles, text: 'reached out to you' },
        accepted: { Icon: CheckCircle2, text: 'accepted your hello' },
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

  // =========================================================
  // PROFILE — streamlined: no hobbies, no favorites
  // =========================================================

  const ProfileScreen = () => {
    const profileAccent = profileMode === 'professional' ? '#4F46E5' : '#FF2D87';

    const statusText = {
      social: 'Most at home at sunrise',
      professional: 'Senior product designer'
    };

    const affiliation = {
      social: 'Berlin \u00b7 ex-NYC',
      professional: 'Series B dev tools startup'
    };

    const bios = {
      social: 'Designer in Berlin, ex-NYC. Sunrise person, long walker, bad at small talk, best over coffee.',
      professional: 'Leading design at a Series B dev tools startup. Open to advising and the occasional coffee.'
    };

    const answers = {
      social: {
        talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
        starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
        dontTalk: ['my ex', 'politics']
      },
      professional: {
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
          <div className="flex flex-col items-center mb-5">
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

            <div className="mt-3 text-center">
              <div className="font-display text-[24px] text-ink">Morgan L.</div>
              <div className="font-body text-[12px] text-faint mt-0.5">@morgan.l \u00b7 29 \u00b7 she/her</div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)' }}>
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
          <div className="mb-5">
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
                { key: 'professional', label: 'Professional', Icon: Briefcase }
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
          </div>

          {/* Status */}
          <div className="mb-4">
            <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-1.5">Status</div>
            <input
              type="text"
              defaultValue={statusText[profileMode]}
              className="w-full px-4 py-3 bg-surface rounded-2xl font-display italic text-[15px] text-ink focus:outline-none border border-warm focus:border-ink transition-colors"
            />
          </div>

          {/* Affiliation */}
          <div className="mb-4">
            <div className="font-body text-[11px] uppercase tracking-wider text-ink mb-1.5">
              {profileMode === 'professional' ? 'Where you work' : 'Notable affiliation'}
            </div>
            <input
              type="text"
              defaultValue={affiliation[profileMode]}
              className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[14px] text-ink focus:outline-none border border-warm focus:border-ink transition-colors"
            />
          </div>

          {/* About me */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-body text-[11px] uppercase tracking-wider text-ink">Bio</div>
              <div className="font-body text-[10px] text-faint">{bios[profileMode].length}/160</div>
            </div>
            <textarea
              defaultValue={bios[profileMode]}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-3 bg-surface rounded-2xl font-body text-[14px] text-ink leading-relaxed focus:outline-none border border-warm focus:border-ink transition-colors resize-none"
            />
          </div>

          {/* Three-question answers — the only content blocks */}
          <div className="mb-5">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={12} style={{ color: profileAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Talk to me about</div>
              </div>
              <div className="space-y-1 mt-2">
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

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <MessageSquare size={12} style={{ color: profileAccent }} />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Conversation starters</div>
              </div>
              <div className="space-y-1 mt-2">
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
              <div className="flex items-center gap-2 mb-0.5">
                <EyeOff size={12} className="text-faint" />
                <div className="font-body text-[11px] uppercase tracking-wider text-ink">Don\u2019t talk about</div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
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

          {/* Quick links */}
          <div className="space-y-2 mb-4">
            {[
              { label: 'Visibility & privacy', sub: 'Radius, ghost mode, who sees you', action: () => setShowSettings(true) },
              { label: 'Notifications', sub: 'New messages, nearby activity' },
              { label: 'Blocked users', sub: '0 people blocked' },
              { label: 'Help & safety', sub: 'Report, guides, contact us' }
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

  // =========================================================
  // PREVIEW — mirrors streamlined profile
  // =========================================================

  const PreviewScreen = () => {
    const previewAccent = profileMode === 'professional' ? '#4F46E5' : '#FF2D87';

    const statusText = {
      social: 'Most at home at sunrise',
      professional: 'Senior product designer'
    };
    const affiliation = {
      social: 'Berlin \u00b7 ex-NYC',
      professional: 'Series B dev tools startup'
    };
    const bios = {
      social: 'Designer in Berlin, ex-NYC. Sunrise person, long walker, bad at small talk, best over coffee.',
      professional: 'Leading design at a Series B dev tools startup. Open to advising and the occasional coffee.'
    };
    const answers = {
      social: {
        talkAbout: ['bookbinding', 'longform podcasts', 'Lisbon last May'],
        starters: ['Coffee or matcha?', 'Last great book you read?', 'Best neighborhood you\u2019ve lived in?'],
        dontTalk: ['my ex', 'politics']
      },
      professional: {
        talkAbout: ['design systems at scale', 'hiring your first designer', 'PM\u2194design friction'],
        starters: ['What are you building?', 'How\u2019s your team structured?', 'Biggest design debt you\u2019re carrying?'],
        dontTalk: ['compensation', 'my old company']
      }
    };

    const actions = getActions(profileMode);
    const PrimaryIcon = actions.primaryIcon;
    const SecondaryIcon = actions.secondaryIcon;

    return (
      <div className="h-full flex flex-col bg-cream relative">
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

        <div className="px-6 pt-2 pb-3 flex items-center justify-between">
          <button onClick={() => setScreen('profile')} className="text-ink opacity-40">
            <ArrowLeft size={20} />
          </button>
          <div className="font-body text-[11px] uppercase tracking-wider" style={{ color: '#A8A3B8' }}>
            in this venue
          </div>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-32">
          <div className="flex items-center gap-4 mb-4">
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
            <div className="flex-1 min-w-0">
              <div className="font-display text-[26px] text-ink leading-tight">Morgan L., 29</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {profileMode === 'professional' ? <Briefcase size={11} className="text-muted" /> : <Heart size={11} className="text-muted" />}
                <span className="font-body text-[11px] uppercase tracking-wider text-muted">{profileMode}</span>
                <div className="w-0.5 h-3 rounded-full bg-faint" />
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(6, 214, 160, 0.15)' }}>
                  <Check size={8} style={{ color: '#06D6A0' }} strokeWidth={3} />
                  <span className="font-body text-[9px] font-medium" style={{ color: '#059669' }}>Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-3.5 border border-warm mb-5">
            <div className="font-display italic text-[15px] text-ink leading-snug">{statusText[profileMode]}</div>
            <div className="font-body text-[12px] text-muted mt-1 flex items-center gap-1.5">
              <Briefcase size={10} className="text-faint" />
              {affiliation[profileMode]}
            </div>
          </div>

          <p className="font-body text-[14px] text-ink leading-relaxed mb-6 italic">
            \u201c{bios[profileMode]}\u201d
          </p>

          <div className="space-y-5">
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

          <div className="mt-8 pt-5 border-t border-warm">
            <div className="font-body text-[11px] uppercase tracking-wider text-faint mb-3 text-center">
              What others see at the bottom
            </div>
            <div className="space-y-2 opacity-60 pointer-events-none">
              <div className="w-full py-3.5 rounded-full font-body font-medium text-white text-[15px] flex items-center justify-center gap-2"
                   style={{ backgroundColor: previewAccent }}>
                <PrimaryIcon size={15} />
                {actions.primary}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 py-3 rounded-full font-body font-medium text-ink text-[14px] bg-surface border border-warm text-center flex items-center justify-center gap-1.5">
                  <SecondaryIcon size={13} />
                  {actions.secondary}
                </div>
                <div className="px-5 py-3 rounded-full font-body text-muted text-[14px]">
                  {actions.tertiary}
                </div>
              </div>
            </div>
          </div>
        </div>

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

  // =========================================================
  // SETTINGS DRAWER
  // =========================================================

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

  // =========================================================
  // BOTTOM NAV
  // =========================================================

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

  // =========================================================
  // MAIN LAYOUT
  // =========================================================

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
            New signup flow with phone verify, username, live selfie check, and mode picker. Streamlined profiles. Mode-aware action buttons.
          </p>
          <div className="mt-6 space-y-2 font-body text-[12px]" style={{ color: '#4A4458' }}>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF2D87' }} /> Social \u2014 Come say hi / Let\u2019s chat</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4F46E5' }} /> Professional \u2014 Let\u2019s connect / Tap me in</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#06D6A0' }} /> Every user verified with a live selfie</div>
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
              {screen === 'signup' && <SignupScreen />}
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
              Tap through. Create an account. Try every tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
