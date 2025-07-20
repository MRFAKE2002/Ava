//! Libraries
import React, { useState } from "react";
import axiosAPIInstance from "../api/axiosInstance";

//! Icons
import { FiLink } from "react-icons/fi";

//! Components
import AudioTextPlayer, {
  type ITranscriptionData,
} from "../audioPlayer/AudioTextPlayer";

function LinkTab() {
  //! States
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcriptionData, setTranscriptionData] =
    useState<ITranscriptionData | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string>("");

  // ✅ ارسال لینک به API
  const sendLinkToAPI = async (linkUrl: string) => {
    try {
      setLoading(true);
      setError("");

      console.log("📤 ارسال لینک به API:", linkUrl);

      // ✅ ذخیره URL اصلی برای پخش
      setOriginalAudioUrl(linkUrl);

      const response = await axiosAPIInstance.post("/transcribe_files/", {
        media_urls: [linkUrl],
      });

      console.log("✅ پاسخ API:", response.data);

      // ✅ ذخیره پاسخ و نمایش نتیجه
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setTranscriptionData(response.data[0]);
        setShowResult(true);
      }
    } catch (error: any) {
      console.error("❌ خطا در ارسال لینک:", error);

      if (error.response?.status === 400) {
        setError("لینک نامعتبر است یا فایل قابل دسترس نیست");
      } else if (error.response?.status === 500) {
        setError("خطا در سرور. لطفاً بعداً تلاش کنید.");
      } else {
        setError("خطا در ارسال درخواست");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ ریست کردن فرم
  const resetLink = () => {
    setUrl("");
    setError("");
    setShowResult(false);
    setTranscriptionData(null);
    setLoading(false);
    setOriginalAudioUrl("");
  };

  //! Functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("لطفاً یک لینک وارد کنید");
      return;
    }

    // بررسی فرمت URL
    try {
      new URL(url);
    } catch {
      setError("لطفاً یک لینک معتبر وارد کنید");
      return;
    }

    // بررسی فرمت فایل
    const validExtensions = [
      ".mp3",
      ".wav",
      ".mp4",
      ".m4a",
      ".flac",
      ".avi",
      ".mov",
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      setError("فرمت فایل در لینک پشتیبانی نمی‌شود");
      return;
    }

    setError("");

    // ارسال به API
    await sendLinkToAPI(url);
  };

  // ✅ اگه نتیجه نمایش داده شده، فقط AudioTextPlayer نشون بده
  if (showResult && transcriptionData) {
    return (
      <div className="w-full h-full">
        <AudioTextPlayer
          transcriptionData={transcriptionData}
          originalAudioUrl={originalAudioUrl}
          onNewRecording={resetLink}
          theme="link" // ✅ تم قرمز
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      {/* فرم */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-primary rounded-full w-10 h-10 flex justify-center items-center">
            <FiLink className="w-4 h-4 text-white" />
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="w-full pr-16 pl-4 py-4 border border-red-primary rounded-full text-center focus:outline-none focus:ring-2 focus:ring-red-primary disabled:opacity-50"
            dir="ltr"
            required
            disabled={loading}
          />
        </div>

        {/* دکمه ارسال */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full py-3 bg-red-primary text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>در حال ارسال...</span>
            </span>
          ) : (
            "🎯 تبدیل به متن"
          )}
        </button>
      </form>

      {/* راهنما */}
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-2 text-center">
          نشانی اینترنتی فایل حاوی گفتار (صوتی/تصویری) را وارد
          <br />و دکمه را فشار دهید
        </p>
        <p className="text-sm text-gray-500">
          فرمت‌های پشتیبانی شده: MP3, WAV, MP4, M4A, FLAC
        </p>
      </div>

      {/* نمایش وضعیت پردازش */}
      {loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-700"></div>
            <span className="text-lg">🔄 در حال پردازش و تبدیل به متن...</span>
          </div>
        </div>
      )}

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center max-w-md">
          <p className="mb-2">❌ {error}</p>
          <button
            onClick={resetLink}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🔄 تلاش مجدد
          </button>
        </div>
      )}
    </div>
  );
}

export default LinkTab;
