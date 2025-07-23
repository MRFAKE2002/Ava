import { useState, useEffect } from "react";
import axiosAPIInstance from "../api/axiosInstance";
import {
  type IAPIResponse,
  convertAPIDataToArchiveFile,
  type IArchiveFile,
} from "../../types/APIType";

interface IUseArchiveAPI {
  files: IArchiveFile[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
  totalPages: number;
  fetchFiles: (page?: number) => Promise<void>;
  deleteFile: (id: number) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

export const useArchiveAPI = (itemsPerPage: number = 8): IUseArchiveAPI => {
  const [files, setFiles] = useState<IArchiveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchFiles = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log(` دریافت فایل‌های صفحه ${page}...`);

      const response = await axiosAPIInstance.get<IAPIResponse>("/requests/", {
        params: {
          page: page,
          page_size: itemsPerPage,
        },
      });

      console.log(" داده‌های API دریافت شد:", response.data);

      // تبدیل داده‌های API
      const convertedFiles = response.data.results.map(
        convertAPIDataToArchiveFile
      );

      setFiles(convertedFiles);
      setTotalCount(response.data.count);
      setHasNext(!!response.data.next);
      setHasPrevious(!!response.data.previous);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("❌ خطا در دریافت فایل‌ها:", error);

      if (error.response?.status === 404) {
        setError("صفحه مورد نظر یافت نشد");
      } else if (error.response?.status === 500) {
        setError("خطا در سرور. لطفاً بعداً تلاش کنید.");
      } else if (!navigator.onLine) {
        setError("اتصال اینترنت برقرار نیست");
      } else {
        setError("خطا در دریافت اطلاعات");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: number) => {
    try {
      console.log(`🗑️ حذف فایل ${id}...`);

      await axiosAPIInstance.delete(`/requests/${id}/`);

      console.log(" فایل حذف شد");

      // حذف از لیست محلی
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (error: any) {
      console.error("❌ خطا در حذف فایل:", error);
      throw new Error("خطا در حذف فایل");
    }
  };

  const refreshFiles = async () => {
    await fetchFiles(currentPage);
  };

  // بارگذاری اولیه
  useEffect(() => {
    fetchFiles(1);
  }, []);

  return {
    files,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    currentPage,
    totalPages,
    fetchFiles,
    deleteFile,
    refreshFiles,
  };
};
