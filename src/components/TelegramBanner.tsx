//src/components/TelegramBanner.ts

export default function TelegramBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-[#229ED9]/10 via-[#229ED9]/20 to-[#229ED9]/10 border border-[#229ED9]/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm my-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center text-white shrink-0 shadow-md">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.68-.55.84-1.12.52l-3.05-2.25-1.47 1.42c-.16.16-.3.3-.61.3l.22-3.11 5.66-5.11c.25-.22-.05-.34-.38-.12l-7 4.41-3.01-.94c-.66-.21-.67-.66.14-.98l11.78-4.54c.55-.2 1.02.13.81.92z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm md:text-base font-bold text-[#0f4c5c]">
            Join our Telegram Channel
          </h3>
          <p className="text-xs md:text-sm text-[#0f4c5c]/70 font-medium">
            Get instant alerts for new အချိန်ပိုင်း အလုပ် (part-time jobs) on your phone.
          </p>
        </div>
      </div>
      <a
        href="https://t.me/parttimemyanmar"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto shrink-0 text-center px-5 py-2.5 bg-[#229ED9] hover:bg-[#1d82b3] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
      >
        Join Channel
      </a>
    </div>
  );
}