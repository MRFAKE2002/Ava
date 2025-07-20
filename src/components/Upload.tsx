//! Libraries
import { useState } from "react";

//! Icons
import { HiOutlineMicrophone } from "react-icons/hi";
import { WiCloudUp } from "react-icons/wi";
import { FiLink } from "react-icons/fi";

//! Components
import RecordTab from "./UploadTabs/RecordTab";
import UploadTab from "./UploadTabs/FileTab";
import TextTab from "./UploadTabs/LinkTab";

function Upload() {
  //! States
  const [activeTab, setActiveTab] = useState("record");

  //! JSX

  return (
    <div
      className={`w-full max-w-[650px] h-[430px] bg-white rounded-l-3xl rounded-br-3xl border ${
        activeTab === "record"
          ? "border-teal-bright"
          : activeTab === "file"
          ? "border-blue-primary"
          : activeTab === "link"
          ? "border-red-primary"
          : "border-gray-300"
      } shadow-lg relative`}
    >
      {/* دکمه‌های تب */}
      <div className="flex justify-center absolute right-0 transform -top-13">
        {/* دکمه ضبط صدا */}
        <button
          onClick={() => setActiveTab("record")}
          className={`px-5 py-3 rounded-t-lg font-medium transition-all group ${
            activeTab === "record"
              ? "bg-teal-primary text-white"
              : "bg-transparent text-gray-500 hover:bg-teal-primary hover:text-white"
          }`}
        >
          <div className="flex items-center">
            <HiOutlineMicrophone
              className={`w-5 h-5 transition-all ${
                activeTab === "record"
                  ? "filter invert brightness-0 saturate-100"
                  : "filter grayscale group-hover:invert group-hover:brightness-0"
              }`}
            />

            <h2 className="mr-2 text-lg">ضبط صدا</h2>
          </div>
        </button>

        {/* دکمه بارگزاری فایل */}
        <button
          onClick={() => setActiveTab("file")}
          className={`px-3 py-2 rounded-t-lg font-medium transition-all group ${
            activeTab === "file"
              ? "bg-blue-primary text-white"
              : "bg-transparent text-gray-500 hover:bg-blue-primary hover:text-white"
          }`}
        >
          <div className="flex items-center">
            <WiCloudUp
              className={`w-8 h-8 transition-all ${
                activeTab === "file"
                  ? "filter invert brightness-0 saturate-100"
                  : "filter grayscale group-hover:invert group-hover:brightness-0"
              }`}
            />

            <h2 className="mr-2 text-lg">بارگزاری فایل</h2>
          </div>
        </button>

        {/* دکمه لینک */}
        <button
          onClick={() => setActiveTab("link")}
          className={`px-6 py-3 rounded-t-lg font-medium transition-all group ${
            activeTab === "link"
              ? "bg-red-primary text-white"
              : "bg-transparent text-gray-500 hover:bg-red-primary hover:text-white"
          }`}
        >
          <div className="flex items-center">
            <FiLink
              className={`w-5 h-5 transition-all ${
                activeTab === "link"
                  ? "filter invert brightness-0 saturate-100"
                  : "filter grayscale group-hover:invert group-hover:brightness-0"
              }`}
            />

            <h2 className="mr-2 text-lg">لینک</h2>
          </div>
        </button>
      </div>

      {/* محتوای هر تب */}
      <div className="flex justify-center items-center h-full w-full">
        {activeTab === "record" && <RecordTab />}
        {activeTab === "file" && <UploadTab />}
        {activeTab === "link" && <TextTab />}
      </div>
    </div>
  );
}

export default Upload;
