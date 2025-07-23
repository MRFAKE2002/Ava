//! Libraries
import React, { useState, useRef, useEffect } from "react";

//! Icons
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { FaCaretUp, FaCaretDown } from "react-icons/fa6";

//! Types
interface UserDropDownProps {}

const Translate: React.FC<UserDropDownProps> = () => {
  //! States
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //! UseEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  const handleLogout = (): void => {
    console.log("خروج از حساب کاربری");
    setIsOpen(false);
  };

  //! JSX

  return (
    <div
      ref={dropdownRef}
      className="flex flex-col justify-center items-center border-2 shadow-lg hover:shadow-xl border-teal-bright rounded-[20px] focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-opacity-50 transition-all duration-300 bg-white"
    >
      {/* دکمه اصلی مهمان */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center px-4 py-2 "
      >

        <span className="text-teal-bright font-medium text-lg mx-3">فارسی</span>

        {isOpen ? (
          <FaCaretUp className="text-teal-bright transition-transform duration-300 mt-2" />
        ) : (
          <FaCaretDown className="text-teal-bright transition-transform duration-300" />
        )}
      </button>

      {isOpen && (
        <div className="w-full overflow-hidden animate-fadeIn">
          {/* خط جداکننده */}
          <div className="flex justify-center my-2">
            <div className="w-3/4 border-t-2 border-teal-bright"></div>
          </div>

          {/* دکمه خروج */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 transition-colors duration-200"
          >
            {/* متن خروج */}
            <span className="font-medium text-lg text-teal-bright mx-5">
              انگلیسی
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Translate;
