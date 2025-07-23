//! Libraries
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  setFileTextMode,
  setFileCurrentTime,
  setFileCopySuccess,
  selectFileState,
} from "../../store/slices/archiveSlice";

//! Icons
import { FaPause, FaStop, FaPlay, FaVolumeUp } from "react-icons/fa";
import { MdSchedule } from "react-icons/md";
import { CiTextAlignRight } from "react-icons/ci";

//! Types
interface ITimedText {
  startTime: number;
  endTime: number;
  text: string;
}

interface ICombinedAudioTextPlayerProps {
  fileId: number;
  originalText?: string;
  timedText?: ITimedText[];
  audioUrl: string;
  duration: string;
}

function CombinedAudioTextPlayer({
  fileId,
  originalText,
  timedText = [],
  audioUrl,
  // duration,
}: ICombinedAudioTextPlayerProps) {
  const dispatch = useAppDispatch();

  // ✅ Redux state برای این فایل
  const fileState = useAppSelector(selectFileState(fileId));
  const { textMode, currentTime, copySuccess } = fileState;

  //! Local States (فقط برای audio player)
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(300);
  const [volume, setVolume] = useState(70);

  //! Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  //! Effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const newTime = Math.floor(audio.currentTime);
      // ✅ Redux state آپدیت کن
      if (newTime !== currentTime) {
        dispatch(setFileCurrentTime({ fileId, time: newTime }));
      }
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(Math.floor(audio.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      dispatch(setFileCurrentTime({ fileId, time: 0 }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [fileId, dispatch, currentTime]);

  //! Functions

  // ✅ تغییر حالت متن (از Redux)
  const handleTextModeChange = (mode: "simple" | "timed") => {
    dispatch(setFileTextMode({ fileId, mode }));
  };

  // ✅ کپی متن (از Redux)
  // const handleCopyText = async () => {
  //   const textToCopy =
  //     textMode === "simple"
  //       ? originalText || ""
  //       : timedText
  //           .map(
  //             (segment, index) =>
  //               `${index + 1}. [${formatTime(segment.startTime)} - ${formatTime(
  //                 segment.endTime
  //               )}] ${segment.text}`
  //           )
  //           .join("\n\n");

  //   try {
  //     await navigator.clipboard.writeText(textToCopy);
  //     dispatch(setFileCopySuccess({ fileId, success: true }));
  //     setTimeout(() => {
  //       dispatch(setFileCopySuccess({ fileId, success: false }));
  //     }, 2000);
  //   } catch (error) {
  //     console.error("خطا در کپی:", error);
  //   }
  // };

  // Audio controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    dispatch(setFileCurrentTime({ fileId, time: 0 }));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * totalDuration;
    const timeToSet = Math.floor(newTime);

    dispatch(setFileCurrentTime({ fileId, time: timeToSet }));

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = timeToSet;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
    }
  };

  const handleSegmentClick = (startTime: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = startTime;
      dispatch(setFileCurrentTime({ fileId, time: startTime }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Text highlighting
  const getCurrentSegment = () => {
    return timedText.find(
      (segment) =>
        currentTime >= segment.startTime && currentTime <= segment.endTime
    );
  };

  const isSegmentActive = (segment: ITimedText) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

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
        <span className="text-teal-bright px-1 py-0.5 rounded font-medium">
          {segmentText}
        </span>
        {text.substring(segmentIndex + segmentText.length)}
      </>
    );
  };

  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const volumePercentage = volume;

  //! JSX
  return (
    <div className="flex-1 flex flex-col h-68">
      {/* نمایش پیام موفقیت کپی */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ متن با موفقیت کپی شد
        </div>
      )}

      {/* Mode Buttons */}
      <div className="flex items-center justify-start flex-shrink-0 mb-4">
        <div className="flex items-center gap-0 border-b border-gray-200 overflow-hidden">
          {/* Text Without Time */}
          <button
            onClick={() => handleTextModeChange("simple")}
            className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer text-md ${
              textMode === "simple" ? `border-b-2` : ""
            }`}
          >
            <CiTextAlignRight className="w-4 h-4" />
            متن ساده
          </button>

          {/* Text With Time */}
          <button
            onClick={() => handleTextModeChange("timed")}
            className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer text-md ${
              textMode === "timed" ? `border-b-2` : ""
            }`}
          >
            <MdSchedule className="w-4 h-4" />
            متن زمان‌بندی شده
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 mb-4">
        {textMode === "simple" ? (
          /* Simple Text */
          <div className="p-4">
            <div className="leading-relaxed text-base text-gray-800 overflow-y-auto h-42">
              {highlightCurrentText(originalText || "متنی موجود نیست")}
            </div>
          </div>
        ) : (
          /* Timed Text */
          <div className="space-y-3 h-50 overflow-y-auto">
            {timedText.map((segment, index) => (
              <div
                key={index}
                onClick={() => handleSegmentClick(segment.startTime)}
                className={`rounded-full px-4 py-3 transition-all duration-300 cursor-pointer ${
                  index % 2 === 0 ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Time Display */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                        isSegmentActive(segment)
                          ? `text-blue-400`
                          : "text-gray-600"
                      }`}
                    >
                      {formatTime(segment.startTime)}
                    </span>
                    <span className="text-gray-400">-</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                        isSegmentActive(segment)
                          ? `text-blue-400`
                          : "text-gray-600"
                      }`}
                    >
                      {formatTime(segment.endTime)}
                    </span>

                    {/* Active Indicator */}
                    {isSegmentActive(segment) && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Text Content */}
                  <p
                    className={`leading-relaxed text-sm flex-1 transition-all duration-300 ${
                      isSegmentActive(segment)
                        ? "text-blue-400 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {segment.text}
                  </p>
                </div>
              </div>
            ))}

            {timedText.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MdSchedule className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>متن زمان‌بندی شده‌ای موجود نیست</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="flex items-center justify-center gap-4 py-2 px-3 bg-gray-100 rounded-full w-fit mx-auto">
        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            style={{ display: "none" }}
          />
        )}

        {/* Volume Control Section */}
        <div className="flex items-center gap-2">
          <div className="relative w-16" style={{ direction: "ltr" }}>
            <div className="w-full h-0.75 bg-gray-400 rounded-full">
              <div
                className="h-full bg-teal-primary rounded-full transition-all duration-200"
                style={{ width: `${volumePercentage}%` }}
              ></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="absolute top-0 right-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>
          <FaVolumeUp className="w-4 h-4 text-gray-600" />
        </div>

        {/* Progress Bar Section */}
        <div className="flex-1 flex items-center gap-3">
          {/* Current Time Display */}
          <span className="text-sm text-gray-400 min-w-12">
            {formatTime(currentTime)}
          </span>

          {/* Progress Bar Container */}
          <div className="relative w-110" style={{ direction: "ltr" }}>
            {/* Background Track */}
            <div
              className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-teal-primary rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Progress Thumb/Circle */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-teal-primary rounded-full shadow-md cursor-pointer transition-all duration-100"
              style={{ left: `${progressPercentage}%` }}
            ></div>
          </div>

        </div>

        {/* Control Buttons Section */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? "مکث" : "پخش"}
          >
            {isPlaying ? (
              <FaPause className="w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopAudio}
            disabled={!audioUrl}
            className="flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="توقف کامل"
          >
            <FaStop className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CombinedAudioTextPlayer;
