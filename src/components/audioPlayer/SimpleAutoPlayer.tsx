// src/components/SimpleAudioPlayer.tsx
//! Libraries
import React, { useState, useEffect, useRef } from "react";

//! Icons
import { FaPause, FaStop, FaPlay, FaVolumeUp } from "react-icons/fa";

//! Types
interface ITimedText {
  startTime: number;
  endTime: number;
  text: string;
}

interface ISimpleAudioPlayerProps {
  audioUrl?: string;
  duration: string;
  timedText?: ITimedText[];
  onTimeUpdate?: (currentTime: number) => void;
}

function SimpleAudioPlayer({
  audioUrl = "",
  duration,
  timedText = [],
  onTimeUpdate,
}: ISimpleAudioPlayerProps) {
  //! States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300); // 5 minutes default
  const [volume, setVolume] = useState(70);

  //! Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  //! Effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const newTime = Math.floor(audio.currentTime);
      setCurrentTime(newTime);
      if (onTimeUpdate) {
        onTimeUpdate(newTime);
      }
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(Math.floor(audio.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onTimeUpdate) {
        onTimeUpdate(0);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  //! Functions
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
    setCurrentTime(0);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

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

    if (onTimeUpdate) {
      onTimeUpdate(timeToSet);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const volumePercentage = volume;

  //! JSX
  return (
    <div className="flex items-center justify-center gap-4 py-1 px-3 bg-gray-50 rounded-3xl">
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
  );
}

export default SimpleAudioPlayer;
  