//! Libraries
import React from "react";

function Sidebar() {
  return (
    <section className="relative w-[166px] min-h-screen rounded-l-[10px] bg-gradient-to-b from-teal-primary to-teal-light">
      <img
        src="/alefba-group.svg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="flex justify-center relative top-12">
        <img src="/ava-icon.svg" alt="" />
        <h1 className="text-2xl mx-4 text-white">آوا</h1>
      </div>
      <div className="flex justify-center w-[150px] rounded-xl bg-teal-dark relative top-[270px] py-2 mx-auto">
        <img src="/speech-icon.svg" alt="" />
        <h2 className="text-white text-xl mx-3">تبدیل گفتار</h2>
      </div>
      <div className="flex justify-center w-[150px] rounded-xl bg-teal-dark relative top-[345px] py-2 mx-auto">
        <img src="/archive-icon.svg" alt="" />
        <h2 className="text-white text-xl mx-6">آرشیو</h2>
      </div>
    </section>
  );
}

export default Sidebar;
