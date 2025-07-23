//! Libraries
import React, { useEffect, useState } from "react";
import axiosAPIInstance from "../api/axiosInstance";

//! Icons
import { WiCloudUp } from "react-icons/wi";

//! Components
import AudioTextPlayer, {
  type ITranscriptionData,
} from "../audioPlayer/AudioTextPlayer";

function FileTab() {
  //! States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcriptionData, setTranscriptionData] =
    useState<ITranscriptionData | null>(null); 
  const [showResult, setShowResult] = useState(false);
  const [originalFileUrl, setOriginalFileUrl] = useState<string>("");

  //! Upload For public Url
  const uploadToPublicUrl = async (file: File): Promise<string> => {
    // tmpfiles.org
    try {
      console.log("تست tmpfiles.org...");
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
          console.log(" tmpfiles.org موفق:", url);
          return url;
        }
      }
    } catch (error) {
      console.log("❌ tmpfiles.org ناموفق");
    }

    throw new Error("امکان آپلود فایل وجود ندارد");
  };

  //  ارسال فایل به API
  const sendFileToAPI = async (file: File, localUrl: string) => {
    try {
      setLoading(true);
      setError("");

      console.log("آپلود فایل...");

      // آپلود و گرفتن URL
      const publicUrl = await uploadToPublicUrl(file);

      console.log(" URL دریافت شد:", publicUrl);
      console.log("📤 ارسال به API...");

      // ارسال URL به API
      const response = await axiosAPIInstance.post("/transcribe_files/", {
        media_urls: [publicUrl],
      });

      console.log(" پاسخ API:", response.data);

      //  ذخیره پاسخ و نمایش نتیجه
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setTranscriptionData(response.data[0]);
        setOriginalFileUrl(localUrl); //  URL محلی برای پخش
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

  //  Effect برای ارسال خودکار
  useEffect(() => {
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      sendFileToAPI(selectedFile, fileUrl);
    }
  }, [selectedFile]);

  //  ریست کردن فایل (برای شروع مجدد)
  const resetFile = () => {
    setSelectedFile(null);
    setError("");
    setShowResult(false);
    setTranscriptionData(null);
    setLoading(false);
    setOriginalFileUrl("");
  };

  //! Functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ریست کردن state های قبلی
    setError("");
    setShowResult(false);
    setTranscriptionData(null);

    // بررسی فرمت
    const validTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/mp4",
      "audio/m4a",
      "audio/flac",
      "video/mp4",
      "video/avi",
      "video/mov",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|mp4|m4a|flac|avi|mov)$/i)
    ) {
      setError("فرمت فایل پشتیبانی نمی‌شود");
      return;
    }

    // بررسی سایز (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("حجم فایل نباید از 50MB بیشتر باشد");
      return;
    }

    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  //  اگه نتیجه نمایش داده شده، فقط AudioTextPlayer نشون بده
  if (showResult && transcriptionData) {
    return (
      <div className="w-full h-full">
        <AudioTextPlayer
          transcriptionData={transcriptionData}
          originalAudioUrl={originalFileUrl}
          onNewRecording={resetFile} //  callback برای انتخاب فایل جدید
          theme="file" //  تم آبی برای FileTab
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      <>
        {/* Input فایل HTML5 */}
        <label className="">
          <div className="flex flex-col items-center justify-center">
            <WiCloudUp
              className={`w-30 h-30 p-5 bg-blue-primary text-white rounded-full cursor-pointer hover:bg-blue-800 hover:scale-110 transition-colors ${
                loading && "hover:cursor-not-allowed"
              }`}
            />
            <p className="text-lg mt-5 text-center">
              {loading ? (
                <span className="text-lg">در حال پردازش و تبدیل به متن...</span>
              ) : (
                <>
                  برای بارگذاری فایل گفتاری (صوتی/تصویری)، دکمه را فشار دهید
                  <br />
                  متن پیاده شده آن، در اینجا ظاهر می شود
                </>
              )}
            </p>
          </div>
          <input
            type="file"
            accept=".mp3,.wav,.mp4,.m4a,.flac,.avi,.mov"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
        </label>

        {/* نمایش خطا */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-center">
            <p className="mb-2">❌ {error}</p>
            <button
              onClick={resetFile}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        )}
      </>
    </div>
  );
}

export default FileTab;
