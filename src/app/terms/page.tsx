//src/app/terms/page.tsx

import Navbar from '../../components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - PartTimeMM',
  description: 'Terms and conditions for using PartTimeMM.',
};

export default function TermsPage() {
  return (
    <main className="relative w-full min-h-screen bg-gray-50 text-[#0f4c5c] antialiased">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: July 2026</p>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">1. Platform Role</h2>
              <p>PartTimeMM is a matching platform that connects job seekers with employers in Myanmar. We do not employ workers directly, nor do we act as an employment agency. We are not responsible for wages, working conditions, or disputes between parties.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">2. User Responsibilities</h2>
              <p>By using this platform, employers agree to post accurate job descriptions and comply with local labor laws. Job seekers agree to provide accurate profile information. Any fraudulent, scam, or abusive postings will result in immediate account termination.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0f4c5c] mb-3">3. Limitation of Liability</h2>
              <p>PartTimeMM guarantees neither the quality of the candidates nor the legitimacy of the employers. Users assume all risks associated with dealing with other users online and offline.</p>
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