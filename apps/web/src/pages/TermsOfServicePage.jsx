import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FileText, ChevronDown, ChevronUp, Mail } from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing or using the HomeOS platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing HomeOS. These terms apply to all users of the platform.',
  },
  {
    title: 'Eligibility',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        <li>You must be at least 18 years of age to use HomeOS.</li>
        <li>You must provide accurate, complete, and current account information.</li>
        <li>You are responsible for maintaining the accuracy of your information.</li>
        <li>HomeOS reserves the right to refuse service to any person or entity.</li>
      </ul>
    ),
  },
  {
    title: 'User Responsibilities',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        <li>Maintain the security and confidentiality of your account credentials.</li>
        <li>Provide accurate and truthful home and property information.</li>
        <li>Use the platform only for lawful purposes.</li>
        <li>Notify HomeOS immediately of any unauthorized account access.</li>
        <li>Not misuse, hack, scrape, or attempt to exploit the platform.</li>
        <li>Not use HomeOS to store or share illegal content.</li>
      </ul>
    ),
  },
  {
    title: 'HomeOS Responsibilities',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        <li>Provide reliable, high-availability platform services.</li>
        <li>Protect user data with enterprise-grade security practices.</li>
        <li>Maintain platform integrity and monitor for abuse.</li>
        <li>Notify users of significant changes to the platform or these terms.</li>
        <li>Respond to support requests in a timely manner.</li>
      </ul>
    ),
  },
  {
    title: 'Prohibited Activities',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        <li>Unauthorized access to accounts, systems, or data belonging to other users.</li>
        <li>Reverse engineering, decompiling, or disassembling any part of the platform.</li>
        <li>Automated scraping, crawling, or data harvesting without written permission.</li>
        <li>Fraudulent activity, impersonation, or misrepresentation.</li>
        <li>Distribution of malware, viruses, or harmful code.</li>
        <li>Using HomeOS in violation of any applicable law or regulation.</li>
      </ul>
    ),
  },
  {
    title: 'Intellectual Property',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>HomeOS and its licensors own all intellectual property rights in the platform, including but not limited to: software, design, trademarks, logos, content, and algorithms.</p>
        <p>Users retain full ownership of all content they upload to HomeOS, including documents, photos, and home data. By uploading content, you grant HomeOS a limited license to use that content solely to provide the service to you.</p>
        <p>The HomeOS name, logo, and platform design are protected trademarks. Unauthorized use is prohibited.</p>
      </div>
    ),
  },
  {
    title: 'Termination',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        <li>Users may delete their account at any time from account settings.</li>
        <li>HomeOS may suspend or terminate accounts that violate these terms.</li>
        <li>HomeOS may terminate accounts with 30 days notice for platform changes.</li>
        <li>Upon termination, your data will be deleted per our Privacy Policy.</li>
      </ul>
    ),
  },
  {
    title: 'Limitation of Liability',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>HomeOS provides insights, recommendations, and data aggregation tools for informational purposes only. HomeOS is not liable for financial, legal, or real estate decisions made using insights generated by the platform.</p>
        <p>The platform is provided "as is" and "as available" without warranties of any kind, express or implied.</p>
        <p>In no event shall HomeOS be liable for indirect, incidental, special, or consequential damages arising from use of the platform.</p>
      </div>
    ),
  },
  {
    title: 'Governing Law',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>These Terms of Service are governed by and construed in accordance with the laws of the United States and the State of Georgia, without regard to conflict of law provisions.</p>
        <p>Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Georgia.</p>
      </div>
    ),
  },
  {
    title: 'Contact',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>For legal inquiries or questions about these Terms of Service, please contact:</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: '#eef2f8', width: 'fit-content' }}>
          <Mail style={{ width: '16px', height: '16px', color: '#1e3a5f' }} />
          <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>legal@homeos.com</span>
        </div>
      </div>
    ),
  },
];

const AccordionSection = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left" style={{ padding: '20px 28px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e8604c', background: '#fdf0ee', padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{section.title}</p>
        </div>
        {open
          ? <ChevronUp style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
          : <ChevronDown style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 28px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
          {typeof section.content === 'string' ? <p>{section.content}</p> : section.content}
        </div>
      )}
    </div>
  );
};

const TermsOfServicePage = () => (
  <>
    <Helmet><title>Terms of Service — HomeOS</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '80px 32px 64px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-120px', right: '-80px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center" style={{ marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '16px' }}>Terms of Service</h1>
          <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.75', maxWidth: '460px', margin: '0 auto 20px' }}>
            Please read these terms carefully before using HomeOS.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: May 2026 · Effective: May 1, 2026</p>
        </div>
      </section>

      <section style={{ padding: '64px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeIn>
            <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {SECTIONS.map((section, i) => (
                <AccordionSection key={i} section={section} index={i} />
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div style={{ marginTop: '32px', padding: '20px 24px', borderRadius: '12px', background: '#eef2f8', border: '1px solid #c7d7eb' }}>
              <p style={{ fontSize: '13px', color: '#1e3a5f', lineHeight: '1.6' }}>
                By using HomeOS, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. For legal questions, contact <span style={{ fontWeight: 700 }}>legal@homeos.com</span>.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="flex flex-wrap gap-3 justify-center" style={{ marginTop: '32px' }}>
              {[['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies'], ['Security', '/security']].map(([label, href], i) => (
                <Link key={i} to={href} className="font-medium hover:opacity-70 transition-opacity" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'underline' }}>{label}</Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default TermsOfServicePage;
