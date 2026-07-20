//src/app/jobs/[id]/opengraph-image.tsx

// src/app/jobs/[id]/opengraph-image.tsx

import { ImageResponse } from 'next/og';
import { createClient } from '../../utils/supabase/server';

// Route segment config
export const alt = 'PartTimeMM Job Listing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch job details securely
  const supabase = await createClient();
  const { data: job } = await supabase
    .from('jobs')
    .select('title, city, township, price, pay_period')
    .eq('id', resolvedParams.id)
    .single();

  // Fallback text if data is missing
  const title = job?.title || 'Part-Time Job in Myanmar';
  const location = job?.township && job?.city ? `${job.township}, ${job.city.split(' ')[0]}` : 'Myanmar';
  const salary = job?.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Price Negotiable';
  const period = job?.pay_period ? `/ ${job.pay_period}` : '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f4c5c', // PartTimeMM Brand Blue
          padding: '80px',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand Tag */}
        <div style={{ display: 'flex', fontSize: 32, color: '#e3b23c', marginBottom: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
          PARTTIMEMM
        </div>
        
        {/* Dynamic Job Title */}
        <div style={{ display: 'flex', fontSize: 68, color: 'white', fontWeight: 900, marginBottom: 50, lineHeight: 1.2 }}>
          {title}
        </div>
        
        {/* Dynamic Footer Details */}
        <div style={{ display: 'flex', gap: '40px', fontSize: 36, color: '#a4c3d2', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: 42 }}>📍</span> {location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: 42 }}>💰</span> {salary} {period}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}