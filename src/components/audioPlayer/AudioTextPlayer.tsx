//! Libraries
import React, { useState, useEffect, useRef } from "react";

//! Icons
import { FaPause, FaStop, FaPlay, FaVolumeUp } from "react-icons/fa";
import { MdSchedule } from "react-icons/md";
import { CiTextAlignRight } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { LuRefreshCw } from "react-icons/lu";

//! Types
interface ISegment {
  start: string;
  end: string;
  text: string;
}

export interface ITranscriptionData {
  media_url: string;
  duration: string;
  segments: ISegment[];
  stats: {
    words: number;
    known_words: number;
  };
}

interface IAudioTextPlayerProps {
  transcriptionData: ITranscriptionData | null;
  originalAudioUrl?: string;
  onNewRecording?: () => void;
  theme?: "record" | "file" | "link"; //  نوع تم برای رنگ‌بندی
}

//! Theme Configuration
interface IThemeConfig {
  border: any;
  primary: string; // رنگ اصلی
  secondary: string; // رنگ ثانویه (تیره‌تر)
  accent: string; // رنگ پس‌زمینه (روشن)
  text: string; // رنگ متن
  hover: string; // رنگ متن
}

const THEME_COLORS: Record<string, IThemeConfig> = {
  record: {
    primary: "bg-teal-500",
    secondary: "bg-teal-600",
    accent: "bg-teal-100",
    text: "text-teal-bright",
    hover: "hover:text-teal-600",
    border: "border-teal-500",
  },
  file: {
    primary: "bg-blue-500",
    secondary: "bg-blue-600",
    accent: "bg-blue-100",
    text: "text-blue-800",
    hover: "hover:text-blue-600",
    border: "border-blue-500",
  },
  link: {
    primary: "bg-red-500",
    secondary: "bg-red-600",
    accent: "bg-red-100",
    text: "text-red-800",
    hover: "hover:text-red-600",
    border: "border-red-500",
  },
};

function AudioTextPlayer({
  transcriptionData,
  originalAudioUrl,
  onNewRecording,
  theme = "record",
}: IAudioTextPlayerProps) {
  //! States - وضعیت‌های کامپوننت
  const [isPlaying, setIsPlaying] = useState(false); // آیا صوت در حال پخش است؟
  const [currentTime, setCurrentTime] = useState(0); // زمان فعلی پخش (ثانیه)
  const [totalDuration, setTotalDuration] = useState(0); // مدت کل صوت (ثانیه)
  const [volume, setVolume] = useState(70); // میزان صدا (0-100)
  const [textMode, setTextMode] = useState<"simple" | "timed">("simple"); // نوع نمایش متن
  const [audioError, setAudioError] = useState<string>(""); // پیام خطا برای صوت
  const [copySuccess, setCopySuccess] = useState(false); // نمایش پیام موفقیت کپی

  //! Refs
  const audioRef = useRef<HTMLAudioElement>(null); // مرجع به تگ audio

  //! Helper Functions

  /**
   * تبدیل فرمت زمان "0:00:1.260" به ثانیه
   * @param timeString - رشته زمان از API
   * @returns عدد ثانیه
   */
  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(":");
    if (parts.length === 3) {
      const minutes = parseInt(parts[1]);
      const seconds = parseFloat(parts[2]);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  /**
   * تبدیل ثانیه به فرمت mm:ss
   * @param seconds - تعداد ثانیه
   * @returns رشته فرمت شده
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * انتخاب URL مناسب برای پخش صوت
   * اولویت: URL محلی > URL خارجی > media_url از API
   */
  const getAudioUrl = () => {
    if (originalAudioUrl && originalAudioUrl.startsWith("blob:")) {
      console.log("🎵 استفاده از URL محلی:", originalAudioUrl);
      return originalAudioUrl;
    }

    if (originalAudioUrl) {
      console.log("🎵 استفاده از URL خارجی:", originalAudioUrl);
      return originalAudioUrl;
    }

    if (transcriptionData?.media_url) {
      console.log("🎵 استفاده از media_url:", transcriptionData.media_url);
      return transcriptionData.media_url;
    }

    return null;
  };

  /**
   * دریافت تنظیمات رنگ بر اساس تم انتخابی
   */
  const getThemeColors = () => {
    return THEME_COLORS[theme] || THEME_COLORS.record;
  };

  // تبدیل segments به فرمت قابل استفاده با زمان‌های عددی
  const processedSegments =
    transcriptionData?.segments?.map((segment) => ({
      startTime: parseTimeToSeconds(segment.start),
      endTime: parseTimeToSeconds(segment.end),
      text: segment.text,
    })) || [];

  // متن کامل تمام segments
  const fullText =
    transcriptionData?.segments.map((s) => s.text).join(" ") || "";

  // URL صوتی نهایی
  const audioUrl = getAudioUrl();

  // رنگ‌های تم فعلی
  const themeColors = getThemeColors();

  //! Text Processing Functions - توابع پردازش متن

  /**
   * محاسبه حجم متن به بایت
   * @param text - متن مورد نظر
   * @returns رشته نمایش حجم
   */
  const calculateTextSize = (text: string): string => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text).length;

    if (bytes < 1024) {
      return `${bytes} بایت`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
    }
  };

  /**
   * آماده‌سازی متن برای دانلود بر اساس حالت انتخابی
   */
  const prepareTextForDownload = () => {
    return textMode === "simple"
      ? fullText
      : processedSegments
          .map(
            (segment, index) =>
              `${index + 1}. [${formatTime(segment.startTime)} - ${formatTime(
                segment.endTime
              )}]\n${segment.text}\n`
          )
          .join("\n");
  };

  /**
   * محاسبه حجم متن فعلی برای نمایش
   */
  const getCurrentTextSize = (): string => {
    const currentText = prepareTextForDownload();
    return calculateTextSize(currentText);
  };

  //! Action Functions - توابع عملیات

  /**
   * دانلود متن به صورت فایل .txt
   */
  const downloadText = () => {
    const textToDownload = prepareTextForDownload();
    const textSize = calculateTextSize(textToDownload);

    console.log(`📦 حجم فایل: ${textSize}`);

    // ایجاد Blob از متن
    const blob = new Blob([textToDownload], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    // ایجاد لینک دانلود موقت
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcription-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();

    // پاکسازی
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(` فایل متن (${textSize}) دانلود شد`);
  };

  /**
   * کپی متن به کلیپ‌بورد
   */
  const copyText = async () => {
    const textToCopy =
      textMode === "simple"
        ? fullText
        : processedSegments
            .map(
              (segment, index) =>
                `${index + 1}. [${formatTime(segment.startTime)} - ${formatTime(
                  segment.endTime
                )}] ${segment.text}`
            )
            .join("\n\n");

    try {
      // روش مدرن کپی
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log(" متن کپی شد");
    } catch (error) {
      console.error("❌ خطا در کپی:", error);

      // روش جایگزین برای مرورگرهای قدیمی
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log(" متن کپی شد (روش جایگزین)");
    }
  };

  //! Audio Effects - اثرات صوتی
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // تابع به‌روزرسانی زمان فعلی
    const handleTimeUpdate = () => {
      const newTime = Math.floor(audio.currentTime);
      setCurrentTime(newTime);
    };

    // تابع بارگذاری metadata صوت
    const handleLoadedMetadata = () => {
      setTotalDuration(Math.floor(audio.duration));
      setAudioError("");
      console.log(" Audio loaded successfully");
    };

    // تابع پایان پخش
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // تابع مدیریت خطاهای صوتی
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const error = target.error;

      console.error("❌ Audio Error:", error);

      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            setAudioError("پخش صوت لغو شد");
            break;
          case error.MEDIA_ERR_NETWORK:
            setAudioError("خطا در شبکه - فایل قابل دسترس نیست");
            break;
          case error.MEDIA_ERR_DECODE:
            setAudioError("خطا در رمزگشایی فایل صوتی");
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setAudioError("فرمت فایل صوتی پشتیبانی نمی‌شود");
            break;
          default:
            setAudioError("خطا در پخش صوت");
        }
      }

      setIsPlaying(false);
    };

    // اضافه کردن event listener ها
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // پاکسازی event listener ها
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [transcriptionData, originalAudioUrl]);

  //! Audio Controls - کنترل‌های صوتی

  /**
   * تغییر وضعیت پخش/توقف
   */
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("❌ خطا در پخش:", error);
      setAudioError("امکان پخش صوت وجود ندارد");
      setIsPlaying(false);
    }
  };

  /**
   * توقف کامل پخش
   */
  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  /**
   * کلیک روی نوار پیشرفت برای جهش به زمان مشخص
   */
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * totalDuration;
    const timeToSet = Math.floor(newTime);

    setCurrentTime(timeToSet);

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = timeToSet;
    }
  };

  /**
   * تغییر میزان صدا
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
    }
  };

  /**
   * کلیک روی segment برای پرش به زمان آن
   */
  const handleSegmentClick = (startTime: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  //! Text Highlighting Logic - منطق برجسته‌سازی متن

  /**
   * پیدا کردن segment فعلی بر اساس زمان پخش
   */
  const getCurrentSegment = () => {
    return processedSegments.find(
      (segment) =>
        currentTime >= segment.startTime && currentTime <= segment.endTime
    );
  };

  /**
   * تشخیص اینکه آیا segment مشخص فعال است
   */
  const isSegmentActive = (segment: (typeof processedSegments)[0]) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

  /**
   * برجسته‌سازی متن فعلی در حالت simple
   */
  const highlightCurrentText = (text: string) => {
    if (textMode !== "simple") return text;

    const currentSegment = getCurrentSegment();
    if (!currentSegment) return text;

    const segmentText = currentSegment.text;
    const segmentIndex = text.indexOf(segmentText);

    if (segmentIndex === -1) return text;

    return (
      <>
        {text.substring(0, segmentIndex)}
        <span
          className={`${themeColors.accent} ${themeColors.text} px-2 py-1 rounded-md font-medium animate-pulse `}
        >
          {segmentText}
        </span>
        {text.substring(segmentIndex + segmentText.length)}
      </>
    );
  };

  // محاسبه درصد پیشرفت پخش
  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // بررسی وجود داده
  if (!transcriptionData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>هیچ داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  //! JSX Return
  return (
    <div className="space-y-6">
      {/* نمایش پیام موفقیت کپی */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          متن با موفقیت کپی شد
        </div>
      )}

      {/* نمایش خطای صوتی */}
      {audioError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
          ❌ {audioError}
        </div>
      )}

      {/* Content */}
      <div className="pt-6 px-10">
        {/* Buttons */}
        <div className="flex items-center justify-between border-b border-gray-300 overflow-hidden mb-3">
          {/* Text & Text With Time */}
          <div className="flex items-center">
            {/* Text */}
            <button
              onClick={() => setTextMode("simple")}
              className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer text-md ${
                textMode === "simple" ? `border-b-2 ${themeColors.border}` : ""
              }`}
            >
              <CiTextAlignRight className="w-4 h-4" />
              <span>متن ساده</span>
            </button>

            {/* Text With Time */}
            <button
              onClick={() => setTextMode("timed")}
              className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer text-md ${
                textMode === "timed" ? `border-b-2 ${themeColors.border}` : ""
              }`}
            >
              <MdSchedule className="w-4 h-4" />
              <span>متن زمان‌بندی شده</span>
            </button>
          </div>

          {/* Download & Copy & Restart */}
          <div className="flex items-center">
            {/* Download */}
            <button
              onClick={downloadText}
              className={`text-gray-500 ${themeColors.hover} pr-4 rounded transition-colors cursor-pointer`}
              title={`دانلود متن (${getCurrentTextSize()})`}
            >
              <BsDownload className="w-5 h-5" />
            </button>

            {/* Copy */}
            <button
              onClick={copyText}
              className={`text-gray-500 ${themeColors.hover} px-4 rounded transition-colors cursor-pointer`}
              title="کپی متن"
            >
              <FiCopy className="w-5 h-5" />
            </button>

            {/* Restart */}
            {onNewRecording && (
              <button
                onClick={onNewRecording}
                className={`flex items-center gap-2 px-4 py-2 ${themeColors.primary} text-white rounded-full hover:${themeColors.secondary} cursor-pointer transition-colors`}
              >
                <LuRefreshCw className="w-4 h-4" />
                شروع دوباره
              </button>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="h-60 overflow-hidden">
          {textMode === "simple" ? (
            /* Text */
            <div className="p-4 pb-0 max-h-58 overflow-y-auto">
              <div className="leading-relaxed text-base overflow-y-auto">
                {highlightCurrentText(fullText)}
              </div>
            </div>
          ) : (
            /* Text With Time */
            <div className="space-y-3 max-h-58 overflow-y-auto">
              {processedSegments.map((segment, index) => (
                <div
                  key={index}
                  onClick={() => handleSegmentClick(segment.startTime)}
                  className={`rounded-full px-4 py-3 transition-all duration-300 cursor-pointer ${
                    index % 2 === 0 ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Time Segments*/}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          isSegmentActive(segment)
                            ? `${themeColors.text}`
                            : "text-gray-600"
                        }`}
                      >
                        {formatTime(segment.startTime)}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          isSegmentActive(segment)
                            ? `${themeColors.text}`
                            : "text-gray-600"
                        }`}
                      >
                        {formatTime(segment.endTime)}
                      </span>
                      {/* Circle Show Highlight */}
                      {isSegmentActive(segment) && (
                        <div
                          className={`w-2 h-2 ${themeColors.primary} rounded-full animate-pulse`}
                        ></div>
                      )}
                    </div>

                    {/* Text Segments */}
                    <p
                      className={`leading-relaxed text-sm flex-1 ${
                        isSegmentActive(segment)
                          ? `${themeColors.text} font-medium`
                          : "text-gray-700"
                      }`}
                    >
                      {segment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-4 px-14">
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gray-50 rounded-full">
          {/* المان صوتی مخفی */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              style={{ display: "none" }}
              crossOrigin="anonymous"
            />
          )}

          {/* Control Volume */}
          <div className="flex items-center gap-2">
            <div className="relative w-16">
              <div
                className="w-full h-1 bg-gray-300 rounded-full"
                style={{ direction: "ltr" }}
              >
                <div
                  className={`h-full ${themeColors.primary} rounded-full transition-all`}
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute top-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
            <FaVolumeUp className="w-4 h-4 text-gray-600 cursor-pointer" />
          </div>

          {/* نوار پیشرفت */}
          <div
            className="flex-1 flex items-center gap-3"
            style={{ direction: "ltr" }}
          >
            <span className="text-sm text-gray-500 min-w-12">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1">
              <div
                className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className={`h-full ${themeColors.primary} rounded-full transition-all`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              {/* Circle Percentage */}
              <div
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 ${themeColors.secondary} rounded-full shadow-md`}
                style={{ left: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {/* Pause & Play */}
            <button
              onClick={togglePlay}
              disabled={!audioUrl || !!audioError}
              className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              {isPlaying ? (
                <FaPause className="w-3 h-3" />
              ) : (
                <FaPlay className="w-3 h-3" />
              )}
            </button>

            {/* Stop */}
            <button
              onClick={stopAudio}
              disabled={!audioUrl || !!audioError}
              className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaStop className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioTextPlayer;
