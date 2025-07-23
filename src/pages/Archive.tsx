//! Libraries
import React, { useState, useRef, useEffect } from "react";

//! Archive API Hook
import { useArchiveAPI } from "../components/hooks/useArchiveAPI";

//! Types Imports
import type { IArchiveFile } from "../types/APIType";

//! Redux
import { useAppSelector, useAppDispatch } from "../components/hooks/redux";
import {
  setFiles,
  setTotalCount,
  setCurrentPage,
  setTotalPages,
  setExpandedRow,
  // setFileTextMode,
  // setFileCurrentTime,
  setFileDeleteLoading,
  setFileCopySuccess,
  removeFile,
  selectFiles,
  // selectTotalCount,
  selectCurrentPage,
  selectTotalPages,
  selectExpandedRow,
  // selectFileState,
} from "../store/slices/archiveSlice";

//! Icons
import { MdFolder, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { WiCloudUp } from "react-icons/wi";
import { GoLink } from "react-icons/go";
import { HiOutlineMicrophone } from "react-icons/hi";
import { BsDownload } from "react-icons/bs";
import { RiFileWordLine } from "react-icons/ri";
import { FiCopy } from "react-icons/fi";
import { FaTrashCan } from "react-icons/fa6";

//! Components
import CombinedAudioTextPlayer from "../components/audioPlayer/CombinedAudioTextPlayer";

//! Axios API Instance
import axiosAPIInstance from "../components/api/axiosInstance";

function Archive() {
  // ✅ Redux hooks
  const dispatch = useAppDispatch();
  const reduxFiles = useAppSelector(selectFiles);
  // const reduxTotalCount = useAppSelector(selectTotalCount);
  const reduxCurrentPage = useAppSelector(selectCurrentPage);
  const reduxTotalPages = useAppSelector(selectTotalPages);
  const expandedRow = useAppSelector(selectExpandedRow);

  //! API Hook
  const {
    files,
    loading,
    error: apiError,
    totalCount,
    currentPage,
    totalPages,
    fetchFiles,
    // deleteFile,
    refreshFiles,
  } = useArchiveAPI(8);

  // ✅ Sync API data with Redux
  useEffect(() => {
    dispatch(setFiles(files));
    dispatch(setTotalCount(totalCount));
    dispatch(setCurrentPage(currentPage));
    dispatch(setTotalPages(totalPages));
  }, [files, totalCount, currentPage, totalPages, dispatch]);

  //! States (فقط searchTerm باقی مونده)
  const [searchTerm
    , setSearchTerm
  ] = useState("");

  console.log(setSearchTerm);
  

  //! Refs
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const rowHeight = 64;

  //! Functions

  // فیلتر کردن فایل‌ها
  const filteredFiles = reduxFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.originalText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // آیکون نوع فایل
  const getFileTypeIcon = (type: IArchiveFile["type"]) => {
    switch (type) {
      case "record":
        return (
          <HiOutlineMicrophone className="w-8 h-8 p-1 bg-teal-500 text-white rounded-full" />
        );
      case "file":
        return (
          <WiCloudUp className="w-8 h-8 p-1 bg-blue-primary text-white rounded-full" />
        );
      case "link":
        return (
          <GoLink className="w-8 h-8 p-1.5 bg-red-primary text-white rounded-full" />
        );
    }
  };

  // ✅ باز/بسته کردن ردیف (از Redux)
  const toggleRowExpansion = (fileId: number) => {
    if (expandedRow === fileId) {
      dispatch(setExpandedRow(null));
    } else {
      dispatch(setExpandedRow(fileId));

      // اسکرول کردن جدول
      setTimeout(() => {
        const expandedIndex = filteredFiles.findIndex(
          (file) => file.id === fileId
        );
        if (expandedIndex >= 4 && tableBodyRef.current) {
          const scrollPosition = expandedIndex * rowHeight;
          tableBodyRef.current.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  // ✅ حذف فایل (از Redux)
  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("آیا از حذف این فایل اطمینان دارید؟")) {
      return;
    }

    try {
      dispatch(setFileDeleteLoading({ fileId, loading: true }));

      console.log(`🗑️ حذف فایل ${fileId}...`);

      await axiosAPIInstance.delete(`/requests/${fileId}/`);

      alert("فایل با موفقیت حذف شد");

      dispatch(removeFile(fileId));

      if (expandedRow === fileId) {
        dispatch(setExpandedRow(null));
      }

      refreshFiles();
    } catch (error: any) {
      console.error("❌ خطا در حذف فایل:", error);

      if (error.response?.status === 404) {
        alert("فایل یافت نشد");
      } else if (error.response?.status === 403) {
        alert("شما مجوز حذف این فایل را ندارید");
      } else if (error.response?.status === 500) {
        alert("خطا در سرور. لطفاً بعداً تلاش کنید");
      } else {
        alert("خطا در حذف فایل");
      }
    } finally {
      dispatch(setFileDeleteLoading({ fileId, loading: false }));
    }
  };

  // دانلود متن
  const handleDownloadText = (file: IArchiveFile) => {
    const textToDownload = file.originalText || "";
    const blob = new Blob([textToDownload], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}_transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ✅ کپی متن (از Redux)
  const handleCopyText = async (file: IArchiveFile) => {
    try {
      await navigator.clipboard.writeText(file.originalText || "");

      dispatch(setFileCopySuccess({ fileId: file.id, success: true }));
      setTimeout(() => {
        dispatch(setFileCopySuccess({ fileId: file.id, success: false }));
      }, 2000);
    } catch (error) {
      console.error("خطا در کپی:", error);
      alert("خطا در کپی متن");
    }
  };

  // تبدیل به Word
  const handleConvertToWord = (file: IArchiveFile) => {
    console.log("تبدیل به Word:", file.name);
  };

  //! Pagination Functions
  const goToPage = (page: number) => {
    fetchFiles(page);
    dispatch(setExpandedRow(null));
    if (tableBodyRef.current) {
      tableBodyRef.current.scrollTop = 0;
    }
  };

  const goToPrevious = () => {
    if (reduxCurrentPage > 1) {
      goToPage(reduxCurrentPage - 1);
    }
  };

  const goToNext = () => {
    if (reduxCurrentPage < reduxTotalPages) {
      goToPage(reduxCurrentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, reduxCurrentPage - delta);
      i <= Math.min(reduxTotalPages - 1, reduxCurrentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (reduxCurrentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (reduxCurrentPage + delta < reduxTotalPages - 1) {
      rangeWithDots.push("...", reduxTotalPages);
    } else {
      if (reduxTotalPages > 1) rangeWithDots.push(reduxTotalPages);
    }

    return rangeWithDots;
  };
  const allFileStates = useAppSelector((state) => state.archive.fileStates);

  //! Render Pagination
  const renderPagination = () => {
    if (reduxTotalPages <= 1) return null;

    return (
      <div className="px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={reduxCurrentPage === 1}
              className={`flex items-center p-2 cursor-pointer outline-0 ${
                reduxCurrentPage === 1 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <MdChevronRight className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`px-3 py-2 rounded-full text-sm font-normal outline-0 ${
                      reduxCurrentPage === page
                        ? "bg-teal-primary text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={reduxCurrentPage === reduxTotalPages}
              className={`flex items-center p-2 cursor-pointer outline-0 ${
                reduxCurrentPage === reduxTotalPages
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <MdChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  //! JSX (دقیقاً همون قبلی)
  return (
    <div className="min-h-screen p-6">
      <main className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-teal-bright text-3xl font-bold mb-2">
              آرشیو من
            </h1>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">در حال بارگذاری فایل‌ها...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {apiError && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="mb-2">❌ {apiError}</p>
            <button
              onClick={() => fetchFiles(reduxCurrentPage)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Table Container */}
        {!loading && !apiError && (
          <div className="rounded-2xl overflow-hidden h-[650px]">
            {filteredFiles.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* Table Header */}
                <div className="flex-shrink-0">
                  <div className="flex">
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 w-20"></div>
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 flex-1">
                      نام فایل
                    </div>
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 w-34">
                      تاریخ پردازش
                    </div>
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 w-28">
                      فرمت
                    </div>
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 w-40">
                      مدت زمان
                    </div>
                    <div className="px-6 py-4 text-right text-md font-semibold text-gray-700 w-30"></div>
                  </div>
                </div>

                {/* Table Body */}
                <div ref={tableBodyRef} className="flex-1 overflow-y-auto">
                  {filteredFiles.map((file, index) => {
                    // ✅ Redux state برای هر فایل
                    const fileState = allFileStates[file.id] || {
                      textMode: "simple" as const,
                      currentTime: 0,
                      deleteLoading: false,
                      copySuccess: false,
                    };
                    return (
                      <div
                        key={file.id}
                        className={`${
                          expandedRow === file.id
                            ? "border-2 border-teal-bright rounded-lg"
                            : "border-b border-gray-100"
                        } ${index % 2 === 0 ? "" : "bg-white"}`}
                      >
                        {/* Main Row */}
                        <div
                          className="flex cursor-pointer transition-colors min-h-[64px]"
                          onClick={() => toggleRowExpansion(file.id)}
                        >
                          {/* File Type Icon */}
                          <div className="px-6 py-4 w-20 flex items-center justify-center">
                            {getFileTypeIcon(file.type)}
                          </div>

                          {/* File Name */}
                          <div className="px-6 py-4 flex-1 flex items-center min-w-0">
                            <span
                              className="text-md font-normal truncate"
                              style={{ direction: "ltr" }}
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>

                          {/* Upload Date */}
                          <div className="px-6 py-4 w-32 flex items-center">
                            <span className="text-sm text-gray-600">
                              {file.uploadDate}
                            </span>
                          </div>

                          {/* File Type */}
                          <div className="px-6 py-4 w-28 flex items-center">
                            <span
                              className=" text-xs font-medium"
                              style={{ direction: "ltr" }}
                            >
                              {file.fileType}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="px-6 py-4 w-24 flex items-center">
                            <span className="text-sm text-gray-600">
                              {file.duration}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="px-6 py-4 w-40 flex items-center">
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Download */}
                              <button
                                onClick={() => handleDownloadText(file)}
                                className="text-gray-400 hover:text-teal-600 p-1 rounded transition-colors cursor-pointer"
                                title="دانلود متن"
                              >
                                <BsDownload className="w-5 h-5" />
                              </button>

                              {/* Convert to Word */}
                              <button
                                onClick={() => handleConvertToWord(file)}
                                className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors cursor-pointer"
                                title="تبدیل به ورد"
                              >
                                <RiFileWordLine className="w-5 h-5" />
                              </button>

                              {/* Copy */}
                              <button
                                onClick={() => handleCopyText(file)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  fileState.copySuccess
                                    ? "text-green-600"
                                    : "text-gray-400 hover:text-teal-600"
                                }`}
                                title="کپی متن"
                              >
                                <FiCopy className="w-5 h-5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                disabled={fileState.deleteLoading}
                                className="text-gray-400 hover:bg-red-600 hover:text-white p-1 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                                title="حذف"
                              >
                                {fileState.deleteLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                ) : (
                                  <FaTrashCan className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedRow === file.id && (
                          <div className="h-90">
                            <div className="px-20 py-3">
                              <CombinedAudioTextPlayer
                                fileId={file.id}
                                originalText={file.originalText}
                                timedText={file.timedText}
                                audioUrl={file.audioUrl || ""}
                                duration={file.duration}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {renderPagination()}
              </div>
            ) : (
              /* Empty State */
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-16">
                  <MdFolder className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-500 mb-3">
                    فایلی یافت نشد
                  </h3>
                  <p className="text-gray-400 text-lg">
                    هنوز فایلی پردازش نشده است
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Archive;
