//! Libraries
import React from "react";

function UploadTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      <button className="rounded-full bg-blue-primary p-5 cursor-pointer hover:scale-125 transition-transform">
        <img
          src="/upload-icon.svg"
          alt="microphone"
          className="w-10 h-10 filter invert brightness-0"
        />
      </button>
      <p className="text-lg text-gray-600 leading-relaxed max-w-2xl text-center">
        برای بارگذاری فایل گفتاری (صوتی/تصویری)، دکمه را فشار دهید
        <br />
        متن پیاده شده آن، در اینجا ظاهر می شود
      </p>
    </div>
  );
}

export default UploadTab;
