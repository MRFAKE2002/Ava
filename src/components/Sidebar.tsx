//! Libraries
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed right-0 top-0 w-[166px] h-screen bg-gradient-to-b from-teal-primary to-teal-light rounded-l-[10px] overflow-hidden">
      {/* تصویر پس‌زمینه */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/alefba-group.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* محتوای Sidebar */}
      <div className="relative h-full flex flex-col">
        {/* لوگو و نام */}
        <div className="flex items-center justify-center pt-12 mb-8">
          <img src="/ava-icon.svg" alt="آوا" className="w-8 h-8" />
          <h1 className="text-2xl text-white font-bold mr-4">آوا</h1>
        </div>

        {/* منوها */}
        <nav className="flex-1 px-2 mt-36">
          {/* دکمه تبدیل گفتار */}
          <div className="mb-12">
            <NavLink
              to="/speech"
              className={`w-full flex items-center justify-center rounded-xl py-3 px-4 text-white transition-all cursor-pointer ${
                location.pathname === "/" || location.pathname === "/speech"
                  ? "bg-teal-dark hover:bg-opacity-80 hover:scale-102"
                  : ""
              }`}
            >
              <img src="/speech-icon.svg" alt="" className="w-5 h-5" />
              <span className="text-lg mr-3">تبدیل گفتار</span>
            </NavLink>
          </div>

          {/* دکمه آرشیو */}
          <div className="mb-6">
            <NavLink
              to="/archive"
              className={`w-full flex items-center justify-center rounded-xl py-3 px-4 text-white transition-all cursor-pointer ${
                location.pathname === "/archive"
                  ? "bg-teal-dark hover:bg-opacity-80 hover:scale-102"
                  : ""
              }`}
            >
              <img src="/archive-icon.svg" alt="" className="w-5 h-5" />
              <span className="text-lg mr-6">آرشیو</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
