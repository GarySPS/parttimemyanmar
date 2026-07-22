// src/components/JobCard.tsx
import Link from 'next/link';

export default function JobCard({ job, t, isClosed, isNew, daysLeft, actionButtons }: any) {
  return (
    <div className="group bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full overflow-hidden">
      
      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`}></Link>
      
      {/* Premium Status Badge (Top Right) */}
      <div className="absolute top-5 right-5 z-10 pointer-events-none">
        {isClosed ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            {t?.closed || 'Closed'}
          </span>
        ) : isNew ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-100/50 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse"></span>
            {t?.newToYou || 'New'}
          </span>
        ) : daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100/50">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {daysLeft} {t?.daysLeft || 'Days Left'}
          </span>
        ) : null}
      </div>

      {/* Top: Title & Tags */}
      <div className="relative z-10 pointer-events-none pr-24 mb-6">
        <h2 className="text-xl md:text-[22px] font-extrabold text-gray-900 leading-[1.6] py-1 group-hover:text-[#0f4c5c] transition-colors mb-3 line-clamp-2">
          {job.title}
        </h2>
        
        <div className="flex flex-col gap-2.5">
          {job.city && job.township && (
            <div className="flex items-center text-[13px] text-gray-500 font-medium">
              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2 border border-gray-100">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {job.township}, {job.city.split(' ')[0]}
            </div>
          )}
          
          <div className="flex items-center text-[13px] text-gray-500 font-medium">
            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-2 border border-gray-100">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            {job.category ? ((t?.cats && t.cats[job.category]) || job.category) : (t?.privateAdvertiser || 'Private Advertiser')}
          </div>
        </div>
      </div>

      {/* Bottom: Price and Actions */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between relative z-20 bg-white">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#a4c3d2] mb-0.5">Pay</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-[#0f4c5c] tracking-tight">
              {job.price ? new Intl.NumberFormat('en-MM').format(job.price) : (t?.priceNegotiable || 'Negotiable')}
              {job.price && <span className="text-base font-bold ml-1">MMK</span>}
            </span>
            {job.pay_period && (
              <span className="text-sm font-semibold text-gray-400 ml-1">
                {(t?.per || 'per ')}{(t?.pays && t.pays[job.pay_period]) || job.pay_period}
              </span>
            )}
          </div>
        </div>
        
        {/* Interactive Actions Passed from Parent */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {actionButtons}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e3b23c]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}