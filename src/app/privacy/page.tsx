//src/app/privacy/page.tsx

import Navbar from '../../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - PartTimeMM',
  description: 'How PartTimeMM handles and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <main className="relative w-full min-h-screen bg-gray-50 text-[#0f4c5c] antialiased">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: July 2026</p>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">1. Information We Collect</h2>
              <p>When you register on PartTimeMM, we collect your email address, securely hashed passwords, and profile details such as your username, contact application preference, and role (employer or seeker).</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">2. How We Use Your Data</h2>
              <p>Your information is used strictly to facilitate job matching, authenticate your login securely, and allow you to manage your job postings or bookmarks. We do not sell your personal data to third-party marketing agencies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">3. Data Security</h2>
              <p>We rely on industry-standard security protocols to protect your data. Your database access is restricted using Row Level Security (RLS) policies, meaning users can only access or modify their own private data.</p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100">
            <Link href="/" className="text-[#e3b23c] font-bold hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}