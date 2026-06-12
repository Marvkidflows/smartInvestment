import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './AboutPage.css';

const TIMELINE = [
  { year:'2018', text:'Founded in Lagos — launched with 50 seed investors and a vision to democratize professional investing.', color:'var(--royal)' },
  { year:'2019', text:'Crossed $10M AUM. Introduced proprietary risk-scoring algorithm. First annual investor report published.', color:'var(--gold)' },
  { year:'2021', text:'Expanded to diaspora market. Launched mobile platform. Partnerships with 3 Tier-1 banks.', color:'var(--royal)' },
  { year:'2023', text:'Surpassed 10,000 active investors. Achieved ISO 27001 certification for data security.', color:'var(--gold)' },
  { year:'2025', text:'Crossed $4.7B AUM. Launched AI-assisted portfolio optimization. Won FinTech Africa Award.', color:'var(--royal)' },
];

const TEAM = [
  { emoji:'👨‍💼', name:'Tony Love',        role:'Chief Executive Officer',      bio:"Veteran finance strategist with 20+ years across hedge funds and private equity." },
  { emoji:'👩‍💻', name:'Amara Osei',        role:'Chief Technology Officer',     bio:"Former Google engineer. Built the proprietary algo-trading engine." },
  { emoji:'👨‍⚖️', name:'David Mensah',      role:'Chief Compliance Officer',     bio:"Ex-SEC regulatory counsel. Ensures international financial compliance." },
  { emoji:'👩‍💹', name:'Fatima Al-Rashid',  role:'Chief Investment Officer',     bio:"Quantitative analyst with expertise in emerging market equities." },
];

const AWARDS = [
  { icon:'🏆', title:'Best FinTech Platform',     org:'Africa FinTech Awards — 2024' },
  { icon:'🥇', title:'Top Investment Manager',    org:'West Africa Finance Summit — 2023' },
  { icon:'⭐', title:'5-Star Transparency Rating', org:'Global Investor Trust Index — 2023' },
  { icon:'🎖️', title:'ISO 27001 Certified',       org:'Information Security — 2022' },
  { icon:'📜', title:'SEC Licensed',              org:'Regulatory Compliance — Since 2018' },
];

const STRATEGY = [
  { icon:'🔬', title:'Quantitative Research',    desc:'Data-driven models screen thousands of opportunities daily, filtering for risk-adjusted returns.' },
  { icon:'⚖️', title:'Dynamic Asset Allocation', desc:'Portfolios rebalance automatically based on real-time market signals and macro indicators.' },
  { icon:'🛡️', title:'Drawdown Control',          desc:'Hard stop-loss parameters limit peak-to-trough losses, protecting capital during volatility.' },
  { icon:'📡', title:'Real-time Monitoring',      desc:'24/7 algorithmic surveillance with human oversight flags anomalies before they become risks.' },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="about-hero__inner">
          <div className="section-eyebrow" style={{ justifyContent:'center', color:'#7EC8E3' }}>Trusted Since 2018</div>
          <h1 className="about-hero__title">About <em>Smart System</em> Investment</h1>
          <p className="about-hero__sub">Where structured wealth meets transparent growth — empowering investors with integrity, clarity, and proven results.</p>
          <nav className="about-breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>About Us</span>
          </nav>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="about-section">
        <div className="container">
          <div className="about-who-grid">
            <div className="about-img-wrap">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" alt="Our team" />
              <div className="about-img-badge">
                <div className="about-img-badge__icon">📈</div>
                <div>
                  <div className="about-img-badge__val">+14.28% YTD</div>
                  <div className="about-img-badge__lbl">Portfolio Growth</div>
                </div>
              </div>
            </div>
            <div className="about-who-text">
              <div className="section-eyebrow">Who We Are</div>
              <h2 className="about-section-title">Built on <em>Integrity</em>, Driven by Results</h2>
              <p>Smart System Investment was founded with a clear mission: to democratize access to professional-grade investment opportunities. We combine cutting-edge technology with proven strategies to deliver consistent, transparent returns.</p>
              <p style={{ marginTop:'1rem' }}>Our team of seasoned financial experts, technologists, and compliance officers works every day to ensure your capital is structured for maximum growth — within carefully defined risk parameters.</p>
              <div className="about-pills">
                {['🏦 SEC Compliant','🔒 Fund Segregation','📊 Real-time Reporting','🌍 Global Reach','⚡ Algo-Assisted Trading'].map(p => (
                  <span key={p} className="about-pill">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="about-stats-bar">
        <div className="container">
          <div className="about-stats-grid">
            {[
              { num:'$4.7B', label:'Total Assets Managed' },
              { num:'12K+',  label:'Active Investors'     },
              { num:'7+',    label:'Years of Operation'   },
              { num:'14%',   label:'Avg. Annual Payout'   },
            ].map(s => (
              <div key={s.label} className="about-stat-item">
                <div className="about-stat-num">{s.num}</div>
                <div className="about-stat-divider" />
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PILLARS */}
      <section className="about-section about-bg-sky">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Our Foundation</div>
            <h2 className="about-section-title">What <em>Drives</em> Us</h2>
          </div>
          <div className="about-pillars">
            {[
              { icon:'🎯', title:'Our Mission', text:'Empowering individuals and institutions to achieve lasting financial freedom through disciplined, data-driven investment management — accessible to everyone.' },
              { icon:'👁️', title:'Our Vision',  text:"To be the world's most trusted and transparent investment platform — where every investor has access to institutional-grade performance." },
              { icon:'⚖️', title:'Our Values',  text:'Transparency in every transaction. Integrity in every decision. Client success as our ultimate benchmark — always above short-term firm interests.' },
            ].map((p, i) => (
              <div key={p.title} className={`about-pillar-card pillar-${i}`}>
                <div className="about-pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="about-section">
        <div className="container" style={{ maxWidth:'800px' }}>
          <div className="section-eyebrow">Our Journey</div>
          <h2 className="about-section-title" style={{ marginBottom:'3rem' }}>From <em>Startup</em> to Industry Leader</h2>
          <div className="about-timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="about-timeline-item">
                <div className="about-timeline-dot" style={{ background: t.color }} />
                <div>
                  <span className="about-timeline-year" style={{ color: t.color }}>{t.year}</span>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="about-section about-bg-sky">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Leadership</div>
            <h2 className="about-section-title">Meet the <em>Team</em></h2>
          </div>
          <div className="about-team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-emoji">{m.emoji}</div>
                <div className="about-team-body">
                  <div className="about-team-name">{m.name}</div>
                  <div className="about-team-role">{m.role}</div>
                  <div className="about-team-bio">{m.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGY */}
      <section className="about-section about-bg-navy">
        <div className="container">
          <div className="about-strategy-grid">
            <div>
              <div className="section-eyebrow" style={{ color:'#7EC8E3' }}>Our Strategy</div>
              <h2 className="about-section-title" style={{ color:'white' }}>How We <em style={{ color:'#7EC8E3' }}>Consistently</em> Deliver</h2>
              <p style={{ color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>Our multi-layer investment strategy is built to weather volatility while capturing growth across market cycles — combining disciplined quantitative analysis with human expertise.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              {STRATEGY.map(s => (
                <div key={s.title} className="about-strategy-item">
                  <div className="about-strategy-icon">{s.icon}</div>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="about-section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Recognition</div>
            <h2 className="about-section-title">Awards & <em>Achievements</em></h2>
          </div>
          <div className="about-awards-grid">
            {AWARDS.map(a => (
              <div key={a.title} className="about-award-card">
                <div className="about-award-icon">{a.icon}</div>
                <div className="about-award-title">{a.title}</div>
                <div className="about-award-org">{a.org}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="about-cta">
        <div className="container" style={{ textAlign:'center' }}>
          <h2>Ready to Grow With Us?</h2>
          <p>Join over 12,000 investors building structured, transparent wealth on Smart System.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', marginTop:'2rem' }}>
            <Link to="/register" className="btn btn-gold btn-lg">🚀 Create Account <FiArrowRight /></Link>
            <Link to="/login"    className="btn btn-outline-white btn-lg">🔑 Investor Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
