// types/api.ts
export interface IAPISegment {
  start: string;
  end: string;
  text: string;
}

export interface IAPIArchiveFile {
  id: number;
  url: string;
  duration: string;
  processed: string;
  segments: IAPISegment[];
  filename: string;
}

export interface IAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAPIArchiveFile[];
}

export interface ITimedText {
  startTime: number;
  endTime: number;
  text: string;
}

export interface IArchiveFile {
  id: number;
  name: string;
  uploadDate: string;
  fileType: string;
  duration: string;
  type: "record" | "file" | "link";
  originalText?: string;
  timedText?: ITimedText[];
  audioUrl?: string;
}

// تبدیل کننده داده‌های API
export const convertAPIDataToArchiveFile = (
  apiFile: IAPIArchiveFile
): IArchiveFile => {
  // تشخیص نوع فایل
  const getFileType = (
    url: string,
    filename: string
  ): "record" | "file" | "link" => {
    if (filename.includes("recorded") || filename.includes("audio_")) {
      return "record";
    }
    if (url.includes("tmpfiles.org")) {
      return "file";
    }
    return "link";
  };

  // تبدیل زمان به ثانیه
  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseFloat(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  // تبدیل segments
  const timedText: ITimedText[] = apiFile.segments
    .filter((segment) => segment.text.trim() !== "")
    .map((segment) => ({
      startTime: parseTimeToSeconds(segment.start),
      endTime: parseTimeToSeconds(segment.end),
      text: segment.text.trim(),
    }));

  // متن کامل
  const originalText = apiFile.segments
    .filter((segment) => segment.text.trim() !== "")
    .map((s) => s.text.trim())
    .join(" ");

  // تشخیص پسوند فایل
  const getFileExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "mp3";
    return `.${ext}`;
  };

  // تبدیل تاریخ به شمسی
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // فرمت مدت زمان
  const formatDuration = (duration: string): string => {
    return duration.replace(/^0:/, "").replace(/\.000$/, "");
  };

  return {
    id: apiFile.id,
    name: apiFile.filename,
    uploadDate: formatDate(apiFile.processed),
    fileType: getFileExtension(apiFile.filename),
    duration: formatDuration(apiFile.duration),
    type: getFileType(apiFile.url, apiFile.filename),
    originalText,
    timedText,
    audioUrl: apiFile.url,
  };
};
