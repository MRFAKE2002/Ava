//! Libraries
import React, { useState } from "react";

function TextTab() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("لطفاً یک لینک معتبر وارد کنید");
      return;
    }

    // بررسی ساده فرمت URL
    if (
      !url.includes(".mp3") &&
      !url.includes(".mp4") &&
      !url.includes(".wav")
    ) {
      setError("فرمت فایل پشتیبانی نمی‌شود. فقط mp3, mp4, wav");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // اینجا API call انجام می‌شود
      // const response = await fetch('/api/process-url', {
      //   method: 'POST',
      //   body: JSON.stringify({ url }),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      // شبیه‌سازی API call
      setTimeout(() => {
        setResult("متن تبدیل شده از فایل صوتی اینجا نمایش داده می‌شود...");
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      setError("خطا در پردازش فایل. دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult("");
    setError("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      {!result ? (
        // فرم ورودی
        <>
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            {/* Input برای URL */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-primary rounded-full w-10 h-10 flex justify-center items-center">
                <img
                  src="/chain-icon.svg"
                  alt="link"
                  className="w-5 h-5 filter invert brightness-0"
                />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com/sample.mp3"
                className="w-full pr-16 pl-4 py-4 border border-red-primary rounded-full text-center bg-white focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </form>

          {/* پیام خطا */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* راهنما */}
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl text-center">
            نشانی اینترنتی فایل حاوی گفتار (صوتی/تصویری) را وارد
            <br />و دکمه را فشار دهید
          </p>
        </>
      ) : (
        // نمایش نتیجه
        <div className="w-full max-w-2xl space-y-4">
          {/* نتیجه */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              متن تبدیل شده:
            </h3>
            <p className="text-gray-700 leading-relaxed">{result}</p>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ml-4"
            >
              کپی متن
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              لینک جدید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextTab;
