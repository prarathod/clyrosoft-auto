import Navbar from '@/components/landing/Navbar'
import ContactForm from '@/components/landing/ContactForm'

// ─── Hero mock browser ──────────────────────────────────────────────────────
function BrowserMock() {
  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 text-center mx-2">
          sharma.cliniqo.in
        </div>
      </div>
      {/* Mini site preview */}
      <div className="bg-blue-600 px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold text-sm">Sharma Dental</span>
          <div className="flex gap-3 text-xs text-blue-200">
            <span>Services</span><span>About</span>
          </div>
          <div className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Book Now</div>
        </div>
        <p className="text-blue-100 text-xs mb-1 font-medium">Dental Clinic · Koramangala, Bangalore</p>
        <h3 className="text-white text-xl font-bold mb-1">Sharma Dental Clinic</h3>
        <p className="text-blue-200 text-xs italic mb-4">&ldquo;Your Smile, Our Priority&rdquo;</p>
        <div className="flex gap-2">
          <div className="bg-white text-blue-600 text-xs font-semibold px-4 py-2 rounded-full">💬 WhatsApp</div>
          <div className="bg-blue-500 text-white text-xs px-4 py-2 rounded-full">📞 Call Us</div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Our Services</p>
        <div className="grid grid-cols-4 gap-2">
          {['🦷 Cleaning', '🔬 Root Canal', '😁 Braces', '✨ Whitening'].map((s) => (
            <div key={s} className="bg-white rounded-lg p-2 text-center text-xs border border-gray-200 text-gray-700">
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white px-5 py-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Reviews</p>
        <div className="flex gap-2">
          {['★★★★★', '★★★★★', '★★★★★'].map((stars, i) => (
            <div key={i} className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="text-yellow-400 text-xs">{stars}</div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Great experience! Very professional.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── How it Works ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'We Find Your Clinic',
    desc: 'We search Google Maps and build a personalized demo website for your clinic — completely free.',
  },
  {
    num: '02',
    icon: '👀',
    title: 'You Preview It',
    desc: 'We send you the demo link on WhatsApp. Your real clinic name, services, and location — all ready.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Go Live in 24 Hours',
    desc: 'Pay ₹299/month and your clinic website goes live the same day. No tech skills needed.',
  },
]

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '💬', title: 'WhatsApp Booking',     desc: 'Patients tap one button to message you directly'     },
  { icon: '📅', title: 'Appointment Form',     desc: 'Simple form that captures patient details'           },
  { icon: '📍', title: 'Google Maps',          desc: 'Patients find and navigate to your clinic easily'    },
  { icon: '📱', title: 'Mobile Responsive',    desc: 'Looks perfect on every phone and screen size'        },
  { icon: '🎨', title: '6 Premium Templates',   desc: 'Classic, Modern, Minimal, Vitality, Elegant, Warm'  },
  { icon: '⚙️', title: 'Dashboard Control',    desc: 'Update content, theme, and services yourself'       },
  { icon: '🔒', title: 'SSL Certificate',      desc: 'Secure HTTPS included — no extra cost'              },
  { icon: '🔄', title: 'Monthly Updates',      desc: 'We keep your site running and up to date'           },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Dr. Priya Nair',
    clinic: 'Nair Skin & Dental',
    city: 'Kochi',
    rating: 5,
    text: 'They sent me a demo site without me asking. I was amazed — it had my clinic name, area, everything. Paid the same day. Highly recommend!',
  },
  {
    name: 'Dr. Arjun Reddy',
    clinic: 'Reddy Multispecialty Clinic',
    city: 'Hyderabad',
    rating: 5,
    text: 'My patients now WhatsApp me directly from the website. Appointments increased 30% in the first month. Worth every rupee.',
  },
  {
    name: 'Dr. Kavitha Iyer',
    clinic: 'Smile Care Dental',
    city: 'Chennai',
    rating: 5,
    text: 'I had no website for 8 years. This team built it in 24 hours and it looks very professional. Very happy with the service.',
  },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Is there a setup fee?',
    a: 'No. We build your demo website completely free. You only pay ₹299/month when you decide to go live.',
  },
  {
    q: 'Can I update my website content?',
    a: 'Yes, you get a simple dashboard where you can change your services, doctor bio, theme, WhatsApp number, and more — no tech skills needed.',
  },
  {
    q: 'What if I don\'t like the demo?',
    a: 'You only pay after seeing your complete demo. If you don\'t like it, you don\'t pay. No obligation whatsoever.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Your demo is ready within 24 hours. After payment, your live website is published within the same day.',
  },
  {
    q: 'Do I need to know any coding?',
    a: 'Not at all. Everything is managed through a simple dashboard. We handle all the technical work.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no lock-in. Cancel anytime from your dashboard or just WhatsApp us.',
  },
]

// ─── Template showcase data ───────────────────────────────────────────────────
const TEMPLATES = [
  {
    key: 'classic',
    label: 'Classic',
    desc: 'Blue · Serif · Centered',
    color: '#2563EB',
    heroBg: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    heroText: '#FFFFFF',
    heroSubtext: 'rgba(255,255,255,0.75)',
    fontHeading: 'Georgia, serif',
    tagline: '"Your Smile, Our Priority"',
  },
  {
    key: 'modern',
    label: 'Modern',
    desc: 'Dark · Bold · Split layout',
    color: '#8B5CF6',
    heroBg: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)',
    heroText: '#FFFFFF',
    heroSubtext: 'rgba(255,255,255,0.65)',
    fontHeading: 'system-ui, sans-serif',
    tagline: 'Your Smile, Our Priority',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    desc: 'Black & White · Ultra-clean',
    color: '#18181B',
    heroBg: '#FAFAFA',
    heroText: '#09090B',
    heroSubtext: '#71717A',
    fontHeading: 'system-ui, sans-serif',
    tagline: 'Your Smile, Our Priority',
  },
  {
    key: 'vitality',
    label: 'Vitality',
    desc: 'Green · Fresh · Health',
    color: '#059669',
    heroBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    heroText: '#111827',
    heroSubtext: '#6B7280',
    fontHeading: 'system-ui, sans-serif',
    tagline: 'Your Smile, Our Priority',
  },
  {
    key: 'elegant',
    label: 'Elegant',
    desc: 'Navy · Gold · Luxury',
    color: '#B45309',
    heroBg: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)',
    heroText: '#FEF3C7',
    heroSubtext: 'rgba(254,243,199,0.65)',
    fontHeading: 'Georgia, serif',
    tagline: '"Your Smile, Our Priority"',
  },
  {
    key: 'warm',
    label: 'Warm',
    desc: 'Coral · Friendly · Rounded',
    color: '#E11D48',
    heroBg: 'linear-gradient(135deg, #FF6B6B 0%, #9F1239 100%)',
    heroText: '#FFFFFF',
    heroSubtext: 'rgba(255,255,255,0.80)',
    fontHeading: 'system-ui, sans-serif',
    tagline: 'Your Smile, Our Priority',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Free demo · No credit card
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 mb-5">
              Your Clinic Deserves a Website<br />
              <span className="text-blue-600">That Actually Works</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We build it for free. You go live in 24 hours.<br />
              <span className="font-bold text-gray-900">₹299/month.</span> Cancel anytime.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-4 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
              >
                🚀 Get Free Demo
              </a>
              <a
                href="#templates"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-semibold px-7 py-4 rounded-xl text-sm transition-colors"
              >
                👁️ View Sample Sites
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">✓ <span>No setup fee</span></span>
              <span className="flex items-center gap-1.5">✓ <span>24-hour delivery</span></span>
              <span className="flex items-center gap-1.5">✓ <span>Cancel anytime</span></span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-100 rounded-3xl opacity-30 blur-xl" />
            <div className="relative">
              <BrowserMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">Simple Process</p>
            <h2 className="text-3xl font-black text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3 text-sm">From zero to live website in 3 easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-blue-100" />
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 text-4xl mb-5 relative z-10">
                  {step.icon}
                </div>
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold z-20">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES SHOWCASE ───────────────────────────────────────────── */}
      <section id="templates" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">Choose Your Style</p>
            <h2 className="text-3xl font-black text-gray-900">6 Professional Templates</h2>
            <p className="text-gray-500 mt-3 text-sm">Every clinic gets a full website. Pick the look that fits you best — switch anytime.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((t) => (
              <a
                key={t.key}
                href={`${process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'https://demo.cliniqo.online'}/demo-${t.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all bg-white"
              >
                {/* Mini preview */}
                <div className="h-36 flex flex-col justify-end p-4 relative overflow-hidden" style={{ background: t.heroBg }}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="relative">
                    <p className="text-xs font-semibold mb-0.5 opacity-70" style={{ color: t.heroSubtext, fontFamily: t.fontHeading }}>Dental Clinic · Bangalore</p>
                    <p className="font-bold text-base leading-tight" style={{ color: t.heroText, fontFamily: t.fontHeading }}>Sharma Dental Clinic</p>
                    <p className="text-xs mt-0.5 opacity-70" style={{ color: t.heroSubtext }}>{t.tagline}</p>
                  </div>
                </div>
                {/* Label */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Preview →</span>
                </div>
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Click any template to see a live preview with a real clinic demo site
          </p>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">Everything Included</p>
            <h2 className="text-3xl font-black text-gray-900">All You Need to Get Patients Online</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">Simple Pricing</p>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Everything Included. No Hidden Fees.</h2>
          <p className="text-gray-500 mb-10">Save more when you commit longer — cancel anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Monthly */}
            <div className="rounded-2xl border-2 border-gray-200 p-7 text-left bg-white hover:border-blue-300 transition-colors">
              <p className="text-sm font-semibold text-gray-500 mb-4">Monthly</p>
              <div className="mb-1">
                <span className="text-4xl font-black text-gray-900">₹299</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Billed monthly</p>
              <a href="#contact" className="block w-full text-center bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors mb-6">
                Get Started
              </a>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {['Custom clinic website','WhatsApp booking button','6 premium templates','Dashboard & analytics','SSL + Mobile responsive','Free demo before you pay'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 6 Months — Popular */}
            <div className="rounded-2xl border-2 border-blue-600 p-7 text-left bg-blue-600 text-white relative shadow-2xl shadow-blue-200 scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <p className="text-sm font-semibold text-blue-200 mb-4">6 Months</p>
              <div className="mb-1">
                <span className="text-4xl font-black">₹1,499</span>
              </div>
              <p className="text-xs text-blue-200 mb-1">₹250/month · billed once</p>
              <p className="text-xs font-bold text-yellow-300 mb-6">🎉 1 month FREE</p>
              <a href="#contact" className="block w-full text-center bg-white text-blue-700 font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors mb-6">
                🚀 Get Started
              </a>
              <ul className="space-y-2.5 text-sm text-blue-100">
                {['Custom clinic website','WhatsApp booking button','6 premium templates','Dashboard & analytics','SSL + Mobile responsive','Free demo before you pay'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly */}
            <div className="rounded-2xl border-2 border-gray-200 p-7 text-left bg-white hover:border-blue-300 transition-colors">
              <p className="text-sm font-semibold text-gray-500 mb-4">1 Year</p>
              <div className="mb-1">
                <span className="text-4xl font-black text-gray-900">₹2,399</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">₹200/month · billed once</p>
              <p className="text-xs font-bold text-green-600 mb-6">🎁 4 months FREE</p>
              <a href="#contact" className="block w-full text-center bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors mb-6">
                Best Value
              </a>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {['Custom clinic website','WhatsApp booking button','6 premium templates','Dashboard & analytics','SSL + Mobile responsive','Free demo before you pay'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
          <p className="text-gray-400 text-xs mt-8">No hidden charges. Cancel anytime. Free demo — no payment needed upfront.</p>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">Real Doctors</p>
            <h2 className="text-3xl font-black text-gray-900">Trusted by Clinic Owners Across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-yellow-400 text-lg mb-3">{'★'.repeat(t.rating)}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                    {t.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.clinic} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">FAQ</p>
            <h2 className="text-3xl font-black text-gray-900">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA ────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-3">Free. No credit card.</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Want to See Your<br />Free Demo Website?
            </h2>
            <p className="text-blue-100 text-base mb-8 leading-relaxed">
              Fill in your details. We will build your personalized clinic website and send it to you on WhatsApp within 24 hours — for free.
            </p>
            <div className="space-y-3">
              {[
                '✓  Personalized with your clinic name & info',
                '✓  Real website, not a template screenshot',
                '✓  WhatsApp booking button included',
                '✓  No payment until you are satisfied',
              ].map((point, i) => (
                <p key={i} className="text-blue-100 text-sm">{point}</p>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-white text-sm">Cliniqo</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            {[
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#features',     label: 'Features'     },
              { href: '#pricing',      label: 'Pricing'      },
              { href: '#contact',      label: 'Contact'      },
            ].map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="text-xs text-center">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '919011509422'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              💬 WhatsApp Us
            </a>
            <p className="mt-1">© {new Date().getFullYear()} Cliniqo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
