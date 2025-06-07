//! Libraries
import React from "react";

function RecordTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      <button className="rounded-full bg-teal-primary p-5 cursor-pointer hover:scale-125 transition-transform">
        <img
          src="/mic-icon.svg"
          alt="microphone"
          className="w-10 h-10 filter invert brightness-0"
        />
      </button>
      <p className="text-lg text-gray-600 leading-relaxed max-w-2xl text-center">
        برای شروع به صحبت، دکمه را فشار دهید
        <br />
        متن پیاده شده آن، در اینجا ظاهر شود
      </p>
    </div>
  );
}

export default RecordTab;
