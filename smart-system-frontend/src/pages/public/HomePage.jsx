import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, FiUsers, FiPhone } from 'react-icons/fi';
import './HomePage.css';

const PLANS = [
  {
    name: 'Starter', subtitle: 'Perfect for beginners',
    min: '$1,000', returns: '5% – 7% Monthly',
    features: ['Daily profit distribution', 'Basic daily tasks', 'Email support', 'Withdraw anytime', 'Mobile access'],
    featured: false,
  },
  {
    name: 'Professional', subtitle: 'For serious investors',
    min: '$5,000', returns: '8% – 12% Monthly',
    features: ['Everything in Starter', 'Priority withdrawals', 'Advanced tasks (higher rewards)', 'Priority support', 'Monthly performance reports', 'Investment consultation'],
    featured: true,
  },
  {
    name: 'Elite', subtitle: 'Maximum returns',
    min: '$20,000', returns: '15% – 20% Monthly',
    features: ['Everything in Professional', 'Instant withdrawals', 'VIP exclusive tasks', 'Dedicated account manager', 'Weekly strategy calls', 'VIP events & webinars', 'Custom strategies'],
    featured: false,
  },
];

const STATS = [
  { value: '$4.7B+', label: 'Assets Under Management' },
  { value: '12K+',  label: 'Active Investors'        },
  { value: '7+',    label: 'Years Operating'          },
  { value: '14%',   label: 'Avg. Annual Return'       },
];

const TESTIMONIALS = [
  {
    name: 'John Davidson', role: 'Professional Tier Investor', stars: 5,
    quote: 'I started with the Starter plan and within 6 months, I\'ve grown my portfolio significantly. The platform is incredibly professional and the support is outstanding!',
  },
  {
    name: 'Sarah Martinez', role: 'Elite Tier Investor', stars: 5,
    quote: 'The daily tasks feature is genius! I earn extra income just by spending 10 minutes a day. My returns have consistently exceeded my expectations.',
  },
  {
    name: 'Michael Kim', role: 'Professional Tier Investor', stars: 5,
    quote: 'As a busy professional, I needed a hands-off investment solution. Smart System delivers exactly that. The AI trading handles everything while I watch my wealth grow.',
  },
];

const FAQS = [
  {
    q: 'How does Smart System generate returns?',
    a: 'We use advanced algorithmic trading strategies across multiple markets including forex, cryptocurrencies, and stocks. Our AI-powered systems analyze market data 24/7 to identify profitable opportunities.',
  },
  {
    q: 'What is the minimum investment amount?',
    a: 'Our Starter plan begins at just $1,000. We also offer Professional ($5,000) and Elite ($20,000) tiers for higher returns.',
  },
  {
    q: 'Can I withdraw my funds anytime?',
    a: 'Yes! You can request withdrawals at any time, processed within 24–48 hours for standard accounts and instantly for Elite tier members.',
  },
  {
    q: 'Is my investment secure?',
    a: 'Security is our top priority. We use bank-level encryption, cold storage for crypto assets, and are fully regulated by international financial authorities.',
  },
  {
    q: 'What are daily tasks and how do they work?',
    a: 'Daily tasks are simple activities like checking market updates or completing educational modules. Each takes a few minutes and earns you bonus rewards on top of your regular returns.',
  },
];

function CounterCard({ value, label }) {
  return (
    <div className="stat-card-home">
      <div className="stat-num">{value}</div>
      <div className="stat-dot" />
      <div className="stat-label-home">{label}</div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useRef ? [false, () => {}] : [false, () => {}];
  // simple local state via a small trick
  const ref = useRef(null);
  const toggle = () => {
    const el = ref.current;
    el.classList.toggle('faq-open');
  };
  return (
    <div className="faq-item-home" ref={ref}>
      <button className="faq-q" onClick={toggle}>
        {q} <span className="faq-icon-home">+</span>
      </button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="container hero__inner">
          <div className="hero__left fade-up">
            <div className="hero__badge">
              <span className="hero__pulse" />
              Trusted by 10,000+ Investors Worldwide
            </div>
            <h1 className="hero__title">
              Realize Your Potential With the{' '}
              <em>Right Investment</em>
            </h1>
            <p className="hero__sub">
              Discover high-quality investment opportunities designed to support your financial growth. From starter plans to elite strategies — we have the perfect solution for every investor.
            </p>
            <div className="hero__actions">
              <Link to="/register" className="btn btn-gold btn-lg">
                Get Started <FiArrowRight />
              </Link>
              <div className="hero__social">
                <div className="hero__avatars">
                  {['JD','SM','MK'].map(i => (
                    <div key={i} className="hero__avatar">{i[0]}</div>
                  ))}
                </div>
                <div>
                  <div style={{ color:'#FBBF24', fontSize:'0.85rem' }}>⭐⭐⭐⭐⭐</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.6)' }}>1.5k+ Reviews</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__right">
            <div className="hero__cards">
              <div className="float-card fc-1">
                <div className="fc-label">Daily Returns</div>
                <div className="fc-value">+$127.50</div>
                <div className="fc-change fc-up">↑ 2.5% from yesterday</div>
              </div>
              <div className="float-card fc-2">
                <div className="fc-label">Total Earnings</div>
                <div className="fc-value fc-gold">$5,420</div>
                <div className="fc-change">Since Jan 2025</div>
              </div>
              <div className="float-card fc-3">
                <div className="fc-label">Active Plans</div>
                <div className="fc-value">20</div>
                <div className="fc-change">Currently active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-bar-home">
        <div className="container">
          <div className="stats-grid-home">
            {STATS.map(s => <CounterCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-strip">
        <div className="container">
          <div className="about-strip__inner">
            <div className="about-strip__left">
              <div className="section-eyebrow">About Smart System</div>
              <h2 className="home-section-title">Leading the Way in<br /><em>Investment Excellence</em></h2>
              <p>Since 2018, Smart System Investment has been at the forefront of innovative investment solutions. We combine cutting-edge technology with proven strategies to deliver exceptional returns for our clients across 256+ countries.</p>
              <ul className="about-strip__list">
                <li><FiShield /> <span><strong>SEC Regulated & Licensed</strong> – Fully compliant with international financial regulations</span></li>
                <li><FiTrendingUp /> <span><strong>Proven Track Record</strong> – Consistent returns and satisfied investors worldwide</span></li>
                <li><FiUsers /> <span><strong>Expert Management Team</strong> – 150+ investment professionals with decades of experience</span></li>
              </ul>
              <Link to="/about" className="btn btn-outline">Learn More About Us <FiArrowRight /></Link>
            </div>
            <div className="about-strip__right">
              <div className="about-img-wrap">
                <img src="https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80" alt="Professional team" />
                <div className="about-badge">
                  <span>📊</span>
                  <div>
                    <strong>$4.7B+</strong>
                    <small>Assets Under Management</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Simple Process</div>
            <h2 className="home-section-title">How It Works</h2>
            <p style={{ color:'var(--gray-500)', maxWidth:'520px', margin:'0 auto' }}>Get started with Smart System Investment in 4 simple steps</p>
          </div>
          <div className="how-steps">
            {[
              { n:1, title:'Create Your Account',     desc:'Sign up in less than 2 minutes with just your email address. No complex verification required to get started.' },
              { n:2, title:'Choose Your Plan',         desc:'Select from Starter, Professional, or Elite plans based on your investment goals and risk tolerance.' },
              { n:3, title:'Make Your Deposit',        desc:'Fund your account securely using cryptocurrency, bank transfer, or other supported payment methods.' },
              { n:4, title:'Watch Your Money Grow',    desc:'Track investments in real-time, complete daily tasks for bonuses, and withdraw profits anytime.' },
            ].map((s, i) => (
              <div key={s.n} className="how-step">
                <div className="how-step__num">{s.n}</div>
                {i < 3 && <div className="how-step__line" />}
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="plans-section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Investment Plans</div>
            <h2 className="home-section-title">Choose Your Perfect Plan</h2>
            <p style={{ color:'var(--gray-500)', maxWidth:'520px', margin:'0 auto' }}>Flexible investment tiers designed to match your financial goals and risk tolerance</p>
          </div>
          <div className="plans-grid">
            {PLANS.map(p => (
              <div key={p.name} className={`plan-card ${p.featured ? 'plan-featured' : ''}`}>
                {p.featured && <div className="plan-ribbon">Most Popular</div>}
                <div className="plan-card__header">
                  <h3>{p.name}</h3>
                  <p>{p.subtitle}</p>
                </div>
                <div className="plan-card__price">{p.min} <span>minimum</span></div>
                <div className="plan-returns">{p.returns}</div>
                <ul className="plan-features">
                  {p.features.map(f => (
                    <li key={f}><FiCheckCircle /> {f}</li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${p.featured ? 'btn-gold' : 'btn-outline'} btn-lg`} style={{ width:'100%', justifyContent:'center' }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Success Stories</div>
            <h2 className="home-section-title">What Our Investors Say</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="t-stars">{'⭐'.repeat(t.stars)}</div>
                <p className="t-quote">"{t.quote}"</p>
                <div className="t-author">
                  <div className="t-avatar">{t.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section-home">
        <div className="container">
          <div className="faq-grid-home">
            <div>
              <div className="section-eyebrow">FAQ</div>
              <h2 className="home-section-title">Frequently Asked<br />Questions</h2>
              <p style={{ color:'var(--gray-500)', marginBottom:'2rem', lineHeight:1.8 }}>
                Everything you need to know. Can't find an answer? Contact our support team.
              </p>
              <Link to="/contact" className="btn btn-outline">Contact Support <FiArrowRight /></Link>
            </div>
            <div className="faq-items-home">
              {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-section__overlay" />
        <div className="container cta-inner">
          <h2>Ready to Start Your Investment Journey?</h2>
          <p>Join over 12,000 investors who are already building their financial future with Smart System Investment.</p>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-gold btn-lg">
              Create Free Account <FiArrowRight />
            </Link>
            <Link to="/contact" className="btn btn-outline-white btn-lg">
              <FiPhone /> Talk to an Expert
            </Link>
          </div>
          <div className="cta-trust">
            {['No credit card required', 'Start with $1,000', 'Withdraw anytime'].map(t => (
              <span key={t}><FiCheckCircle /> {t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
