//! Libraries
import React from "react";

//! Components
import Upload from "../components/Upload";

function Speech() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-16">
        <h1 className="text-teal-bright text-4xl font-bold mb-4">
          تبدیل گفتار به متن
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          آوا با استفاده از هزاران ساعت گفتار با صدای افراد مختلف،
          <br />
          زبان فارسی را یاد گرفته است و می‌تواند متن صحبت‌ها را بنویسد.
        </p>
      </header>

      {/* Upload Section */}
      <section className="flex justify-center mt-28">
        <Upload />
      </section>
    </main>
  );
}

export default Speech;
