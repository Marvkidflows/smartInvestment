import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import './HowItWorksPage.css';

const STEPS = [
  {
    n: 1,
    title: 'Create Your Account',
    desc: 'Sign up in minutes with just your email and basic information. No complicated forms or verification delays. Your account will be active immediately.',
    icon: '👤',
    detail: ['Fill in basic personal info', 'Verify your email', 'Set up security preferences', 'Access your dashboard'],
  },
  {
    n: 2,
    title: 'Choose Your Plan',
    desc: 'Select from Starter, Professional, or Elite plans based on your investment goals and risk tolerance. Each plan is designed for a different investor profile.',
    icon: '📊',
    detail: ['Browse available investment plans', 'Compare returns and features', 'Consult with our advisors', 'Select your preferred plan'],
  },
  {
    n: 3,
    title: 'Make Your Deposit',
    desc: 'Fund your account securely using cryptocurrency, bank transfer, or other supported payment methods. Deposits are processed and confirmed quickly.',
    icon: '💳',
    detail: ['Choose payment method', 'Enter deposit amount', 'Complete secure transfer', 'Receive deposit confirmation'],
  },
  {
    n: 4,
    title: 'Watch Your Money Grow',
    desc: 'Track your investments in real-time, complete daily tasks for bonuses, and withdraw profits anytime. Your dashboard shows all performance data.',
    icon: '📈',
    detail: ['Monitor real-time performance', 'Complete daily bonus tasks', 'Receive daily profit updates', 'Request withdrawals anytime'],
  },
];

const FEATURES = [
  { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL encryption protects every transaction.' },
  { icon: '⚡', title: 'Fast Processing', desc: 'Deposits confirmed within minutes, withdrawals within 24–48 hours.' },
  { icon: '📱', title: 'Mobile Access', desc: 'Monitor your investments from any device, anywhere.' },
  { icon: '🤝', title: '24/7 Support', desc: 'Our team is always available to assist you.' },
  { icon: '📊', title: 'Transparent Reporting', desc: 'Full visibility into your portfolio performance at all times.' },
  { icon: '🎯', title: 'Goal Tracking', desc: 'Set targets and track your progress toward financial freedom.' },
];

export default function HowItWorksPage() {
  return (
    <div className="how-page">
      {/* HERO */}
      <section className="how-hero">
        <div className="how-hero__overlay" />
        <div className="container how-hero__inner">
          <div className="section-eyebrow" style={{ justifyContent:'center' }}>Simple Process</div>
          <h1 className="how-hero__title">How It Works</h1>
          <p className="how-hero__sub">Start investing in 4 simple steps and watch your money grow with Smart System Investment</p>
          <nav className="how-breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>How It Works</span>
          </nav>
        </div>
      </section>

      {/* STEPS — matches your Blade template */}
      <section className="how-steps-section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="how-steps-list">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`how-step-item ${i % 2 === 1 ? 'how-step-item--reverse' : ''}`}>
                <div className="how-step-num">
                  <div className="how-step-circle">{step.n}</div>
                  {i < STEPS.length - 1 && <div className="how-step-connector" />}
                </div>
                <div className="how-step-card">
                  <div className="how-step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <ul className="how-step-details">
                    {step.detail.map(d => (
                      <li key={d}><FiCheckCircle /> {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="how-features-section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div className="section-eyebrow">Platform Features</div>
            <h2 className="how-section-title">Built for Serious Investors</h2>
          </div>
          <div className="how-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="how-feature-card">
                <div className="how-feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="how-cta">
        <div className="container how-cta__inner">
          <h2>Ready to Get Started?</h2>
          <p>Create your account in minutes and start your investment journey today.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-gold btn-lg">Create Account <FiArrowRight /></Link>
            <Link to="/plans"    className="btn btn-outline-white btn-lg">View Plans</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
