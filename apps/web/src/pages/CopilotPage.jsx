import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Send, Sparkles, Home, Shield, Zap, Wrench, TrendingUp,
  FileText, Activity, ChevronRight, X, RefreshCw,
  DollarSign, Clock, Star, MessageCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA & RESPONSES
// ═══════════════════════════════════════════════════════════════════════

const SUGGESTED_PROMPTS = [
  { icon: Shield, text: "What's my insurance coverage gap?", color: '#e8604c', bg: '#fdf0ee' },
  { icon: Wrench, text: 'When should I replace my HVAC filter?', color: '#f97316', bg: '#fff7ed' },
  { icon: FileText, text: 'Show me all receipts for appliances.', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: TrendingUp, text: "What's the ROI on a kitchen remodel?", color: '#059669', bg: '#ecfdf5' },
  { icon: Zap, text: 'How can I lower my utility bills?', color: '#d97706', bg: '#fffbeb' },
  { icon: Home, text: "What's my home worth right now?", color: '#1e3a5f', bg: '#eef2f8' },
];

const MOCK_RESPONSES = {
  "What's my insurance coverage gap?": {
    text: "Based on your home profile, I found **2 coverage gaps** you should address before your next renewal:",
    cards: [
      { type: 'insight', icon: Shield, color: '#dc2626', bg: '#fef2f2', title: 'No Flood Insurance', desc: 'Your property is within 2 miles of a flood zone. Standard homeowners policies exclude flood damage. Estimated cost: $850/yr.' },
      { type: 'insight', icon: Shield, color: '#d97706', bg: '#fffbeb', title: 'Umbrella Policy Gap', desc: 'As a rental property owner, your liability exposure exceeds your current $300K limit. Recommended: $1M umbrella (~$285/yr).' },
    ],
    followUp: 'Would you like me to find insurance providers or review your current policy documents?',
  },
  'When should I replace my HVAC filter?': {
    text: "Based on your maintenance history, your HVAC filter is **overdue for replacement**. Here's what I found:",
    cards: [
      { type: 'timeline', icon: Wrench, color: '#f97316', bg: '#fff7ed', title: 'Last Filter Change', desc: 'March 2025 — 14 months ago. Recommended interval: every 1–3 months for MERV-11 filters.' },
      { type: 'insight', icon: Clock, color: '#1e3a5f', bg: '#eef2f8', title: 'Recommended Action', desc: 'Replace filter immediately. A clogged filter reduces efficiency by 15–25% and increases wear on the compressor.' },
    ],
    followUp: 'Want me to add a filter replacement to your maintenance schedule and set a monthly reminder?',
  },
  'Show me all receipts for appliances.': {
    text: "I found **5 appliance receipts** in your Document Vault. Here's a summary:",
    cards: [
      { type: 'document', icon: FileText, color: '#7c3aed', bg: '#f5f3ff', title: 'HVAC System', desc: 'Installed March 2022 · $8,400 · Johnson & Miller HVAC · Warranty: 10 years parts, 5 years labor' },
      { type: 'document', icon: FileText, color: '#7c3aed', bg: '#f5f3ff', title: 'Refrigerator', desc: 'Purchased June 2021 · $2,100 · Samsung · Warranty: 1 year standard (expired)' },
      { type: 'document', icon: FileText, color: '#7c3aed', bg: '#f5f3ff', title: 'Washer & Dryer', desc: 'Purchased January 2023 · $1,850 pair · LG · Warranty: 3 years (expires Jan 2026)' },
    ],
    followUp: 'Would you like me to open any of these documents or add the warranties to your Warranty Tracker?',
  },
  "What's the ROI on a kitchen remodel?": {
    text: "Based on your home's location, size, and comparable sales, here's an ROI analysis for a kitchen remodel:",
    cards: [
      { type: 'insight', icon: TrendingUp, color: '#059669', bg: '#ecfdf5', title: 'Minor Kitchen Remodel', desc: 'Estimated cost: $25,000–$35,000. Average ROI: 72–80%. Value added: $18,000–$28,000. Best option for your price range.' },
      { type: 'insight', icon: TrendingUp, color: '#d97706', bg: '#fffbeb', title: 'Major Kitchen Remodel', desc: 'Estimated cost: $65,000–$90,000. Average ROI: 55–65%. Value added: $36,000–$58,000. Higher cost, lower return rate.' },
    ],
    followUp: 'Want me to add a renovation project to your planner or find local contractors?',
  },
  'How can I lower my utility bills?': {
    text: "I analyzed your utility spending over the last 12 months and found **3 savings opportunities**:",
    cards: [
      { type: 'insight', icon: Zap, color: '#d97706', bg: '#fffbeb', title: 'Electric — $420/yr savings', desc: 'Your usage is 18% above benchmark for homes your size. Installing a smart thermostat (Nest/Ecobee) can reduce cooling costs significantly.' },
      { type: 'insight', icon: Zap, color: '#0891b2', bg: '#ecfeff', title: 'Internet — $240/yr savings', desc: "You're on a legacy plan at $89/mo. Competing plans in your area offer similar speeds at $69/mo." },
    ],
    followUp: 'Want me to add these recommendations to your maintenance schedule?',
  },
  "What's my home worth right now?": {
    text: "Based on recent comparable sales and market data, here's your current home valuation:",
    cards: [
      { type: 'insight', icon: Home, color: '#1e3a5f', bg: '#eef2f8', title: 'Estimated Value: $1,245,000', desc: 'Confidence: 88%. Up $65,000 (5.5%) from 12 months ago. Source: HomeOS AVM + 3 recent MLS comps.' },
      { type: 'insight', icon: TrendingUp, color: '#059669', bg: '#ecfdf5', title: 'Owner Equity: $615,000', desc: 'Mortgage balance: $630,000. LTV: 50.6%. Your equity has grown $42,000 in the last 12 months.' },
    ],
    followUp: 'Want the full Valuation & Equity Dashboard, or should I run a sell-vs-hold analysis?',
  },
};

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: "Hi! I'm HomeOS Copilot — your home's AI assistant. I can answer questions about your maintenance, documents, insurance, utilities, and valuation. What would you like to know?",
  cards: [],
};

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const InsightCard = ({ card }) => {
  const Icon = card.icon;
  return (
    <div style={{ background: card.bg, borderRadius: '12px', padding: '14px 16px', marginTop: '8px', border: `1px solid ${card.bg}` }}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white' }}>
          <Icon style={{ width: '15px', height: '15px', color: card.color }} />
        </div>
        <div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '13px', marginBottom: '3px' }}>{card.title}</p>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>{card.desc}</p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const formattedText = msg.text?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: '16px' }}>
      {!isUser && (
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a5f', marginRight: '10px', marginTop: '2px' }}>
          <Sparkles style={{ width: '15px', height: '15px', color: 'white' }} />
        </div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          background: isUser ? '#1e3a5f' : 'white',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '14px', color: isUser ? 'white' : '#1e293b', lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ __html: formattedText }} />
        </div>
        {msg.cards && msg.cards.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            {msg.cards.map((card, i) => <InsightCard key={i} card={card} />)}
          </div>
        )}
        {msg.followUp && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', marginTop: '8px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>{msg.followUp}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const CopilotPage = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    setTimeout(() => {
      const response = MOCK_RESPONSES[text] || {
        text: "I don't have specific data on that yet — but once your home is fully connected, I can answer questions about maintenance, insurance, documents, valuation, and more. Try one of the suggested prompts to see me in action.",
        cards: [],
      };
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
      setLoading(false);
    }, 900);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      <Helmet><title>HomeOS Copilot — AI Assistant</title></Helmet>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

        {/* Header */}
        <div style={{ background: '#1e3a5f', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <div>
              <p className="font-semibold text-white" style={{ fontSize: '16px' }}>HomeOS Copilot</p>
              <div className="flex items-center gap-1.5">
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#86efac' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>AI-powered · Connected to your home</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setMessages([WELCOME_MESSAGE]); setShowSuggestions(true); }}
              className="flex items-center gap-1.5 font-medium hover:bg-white/10 rounded-xl transition-colors"
              style={{ padding: '6px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <RefreshCw style={{ width: '13px', height: '13px' }} /> New Chat
            </button>
            <Link to="/dashboard" className="flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
              <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)' }} />
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

            {loading && (
              <div className="flex items-start" style={{ marginBottom: '16px' }}>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a5f', marginRight: '10px' }}>
                  <Sparkles style={{ width: '15px', height: '15px', color: 'white' }} />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: '4px 18px 18px 18px', background: 'white', border: '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#cbd5e1', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested prompts */}
            {showSuggestions && messages.length === 1 && (
              <div style={{ marginTop: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>Try asking…</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <button key={i} onClick={() => sendMessage(p.text)}
                        className="flex items-center gap-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
                        style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px 16px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: '15px', height: '15px', color: p.color }} />
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{p.text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="flex items-end gap-3" style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about your home…"
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: '14px', color: '#1e293b', lineHeight: '1.5', maxHeight: '120px' }}
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                className="flex items-center justify-center rounded-xl hover:opacity-90 transition-all disabled:opacity-30"
                style={{ width: '36px', height: '36px', background: '#1e3a5f', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <Send style={{ width: '16px', height: '16px', color: 'white' }} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
              HomeOS Copilot uses your connected home data to provide personalized insights. Not financial or legal advice.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default CopilotPage;
