//! Libraries
import React from "react";

//! Icons
import { MdSchedule } from "react-icons/md";
import { CiTextAlignRight } from "react-icons/ci";

//! Types
interface ITimedText {
  startTime: number;
  endTime: number;
  text: string;
}

interface ITextHighlighterProps {
  originalText?: string;
  timedText?: ITimedText[];
  currentTime: number;
  textMode: "simple" | "timed";
  onTextModeChange: (mode: "simple" | "timed") => void;
  onStopPropagation?: (e: React.MouseEvent) => void;
  onSegmentClick?: (startTime: number) => void;
}

function TextHighlighter({
  originalText = "",
  timedText = [],
  currentTime,
  textMode,
  onTextModeChange,
  onStopPropagation,
  onSegmentClick,
}: ITextHighlighterProps) {
  //! Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const handleSegmentClick = (segment: ITimedText) => {
    if (onSegmentClick) {
      onSegmentClick(segment.startTime);
    }
  };

  return (
    <div className="rounded-lg flex-1 flex flex-col h-68">
      {/* Mode Buttons */}
      <div className="flex items-center justify-start flex-shrink-0 mb-4">
        <div className="flex items-center gap-0 border-b border-gray-200 overflow-hidden">
          {/* Text Without Time */}
          <button
            onClick={(e) => {
              if (onStopPropagation) onStopPropagation(e);
              onTextModeChange("simple");
            }}
            className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer text-md ${
              textMode === "simple" ? `border-b-2` : ""
            }`}
          >
            <CiTextAlignRight className="w-4 h-4" />
            متن ساده
          </button>

          {/* Text With Time */}
          <button
            onClick={(e) => {
              if (onStopPropagation) onStopPropagation(e);
              onTextModeChange("timed");
            }}
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
      <div className="flex-1">
        {textMode === "simple" ? (
          /* Simple Text */
          <div className="p-4rounded-lg">
            <div className="leading-relaxed text-base text-gray-800 overflow-y-auto h-50">
              {highlightCurrentText(originalText)}
            </div>
          </div>
        ) : (
          /* Timed Text */
          <div className="space-y-3 h-50 overflow-y-auto">
            {timedText.map((segment, index) => (
              <div
                key={index}
                onClick={() => handleSegmentClick(segment)}
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
                          ? `text-blue-300`
                          : "text-gray-600"
                      }`}
                    >
                      {formatTime(segment.startTime)}
                    </span>
                    <span className="text-gray-400">-</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                        isSegmentActive(segment)
                          ? `text-blue-300`
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

    </div>
  );
}

export default TextHighlighter;
