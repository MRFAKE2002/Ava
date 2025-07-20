//! Libraries
import React, { useState, useRef } from "react";

//! Icons
import { HiOutlineMicrophone } from "react-icons/hi";

//! API Instance
import axiosAPIInstance from "../api/axiosInstance";

//! Components
import AudioTextPlayer, {
  type ITranscriptionData,
} from "../audioPlayer/AudioTextPlayer";

function RecordTab() {
  //! States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transcriptionData, setTranscriptionData] =
    useState<ITranscriptionData | null>(null);
  const [showResult, setShowResult] = useState(false);

  //! Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number>(0);

  // ✅ شروع ضبط صدا
  const startRecording = async () => {
    try {
      // ریست کردن state های قبلی
      setError("");
      setShowResult(false);
      setTranscriptionData(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      // ✅ بعد از توقف ضبط، مستقیماً API بزن
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);

        setRecordedAudio(audioUrl);
        setAudioBlob(blob);

        // ✅ مستقیماً ارسال به API
        await sendAudioToApi(blob, audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      setError("دسترسی به میکروفون رد شد");
    }
  };

  // ✅ توقف ضبط
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // این خودش mediaRecorder.onstop رو فراخوانی می‌کنه
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // ✅ ریست کردن ضبط (برای شروع مجدد)
  const resetRecording = () => {
    setRecordedAudio("");
    setAudioBlob(null);
    setDuration(0);
    setError("");
    setShowResult(false);
    setTranscriptionData(null);
    setLoading(false);
  };

  // ✅ آپلود به سرویس‌های مختلف
  const uploadToPublicUrl = async (blob: Blob): Promise<string> => {
    const file = new File([blob], "recorded.mp3", { type: "audio/mp3" });

    try {
      console.log("🔄 آپلود به tmpfiles.org...");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          const url = data.data.url.replace(
            "tmpfiles.org/",
            "tmpfiles.org/dl/"
          );
          console.log("✅ آپلود موفق:", url);
          return url;
        }
      }
    } catch (error) {
      console.log("❌ آپلود ناموفق:", error);
    }

    throw new Error("امکان آپلود فایل وجود ندارد");
  };

  // ✅ ارسال صدا به API (پارامتر اختیاری)
  const sendAudioToApi = async (blob?: Blob, localUrl?: string) => {
    const targetBlob = blob || audioBlob;
    const targetLocalUrl = localUrl || recordedAudio;

    if (!targetBlob) {
      setError("هیچ فایل صوتی برای ارسال وجود ندارد");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🔄 شروع پردازش...");

      // آپلود و گرفتن URL خارجی
      const publicUrl = await uploadToPublicUrl(targetBlob);

      console.log("✅ URL دریافت شد:", publicUrl);
      console.log("📤 ارسال به API...");

      // ارسال URL به API
      const response = await axiosAPIInstance.post("/transcribe_files/", {
        media_urls: [publicUrl],
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
      console.error("❌ خطا:", error);

      if (error.message.includes("امکان آپلود")) {
        setError("امکان آپلود فایل وجود ندارد. لطفاً دوباره تلاش کنید.");
      } else if (error.response?.status === 400) {
        setError("فایل نامعتبر است");
      } else if (error.response?.status === 500) {
        setError("خطا در سرور. لطفاً بعداً تلاش کنید.");
      } else {
        setError("خطا در پردازش فایل");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ فرمت زمان
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ اگه نتیجه نمایش داده شده، فقط AudioTextPlayer نشون بده
  if (showResult && transcriptionData) {
    return (
      <div className="w-full absolute top-0">
        <AudioTextPlayer
          transcriptionData={transcriptionData}
          originalAudioUrl={recordedAudio}
          onNewRecording={resetRecording} // ✅ callback برای شروع ضبط جدید
          theme="record" // یا "file" یا "link"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      {/* دکمه ضبط */}
      {!loading && (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          className={`rounded-full p-8 transition-all duration-300 hover:cursor-pointer ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-teal-primary hover:bg-teal-600 hover:scale-110"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <HiOutlineMicrophone className="w-8 h-8 text-white" />
        </button>
      )}
      {/* نمایش زمان ضبط */}
      {isRecording && (
        <div className="text-2xl font-mono text-red-600 animate-pulse">
          🔴 {formatTime(duration)}
        </div>
      )}

      {/* نمایش وضعیت پردازش */}
      {loading && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6"></div>
            <span className="text-lg">🔄 در حال پردازش و تبدیل به متن...</span>
          </div>
        </div>
      )}

      {/* متن راهنما */}
      {!loading && !isRecording && (
        <p className="text-lg mt-3 text-center">
          برای شروع به صحبت، دکمه را فشار دهید
          <br />
          متن پیاده شده آن، در اینجا ظاهر شود
        </p>
      )}

      {isRecording && !loading && (
        <p className="text-lg text-gray-600 text-center">
          در حال ضبط... برای توقف و تبدیل به متن کلیک کنید
        </p>
      )}

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-center">
          <p className="mb-2">❌ {error}</p>
          <button
            onClick={resetRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🔄 تلاش مجدد
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordTab;
