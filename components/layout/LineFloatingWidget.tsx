"use client";

import { useState } from "react";
import { X } from "lucide-react";

const LINE_URL = "https://page.line.me/brj4652s?openQrModal=true";
const LINE_IMAGE =
  "https://trans.nani.com.tw/NaniWeb/images/front-end/LINE@%E6%94%BE%E5%85%A5%E5%AE%98%E7%B6%B2/pc(1).jpg";

export default function LineFloatingWidget() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-white shadow-md transition-colors hover:bg-gray-700"
      >
        <X size={16} />
      </button>

      {/* LINE image card */}
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg shadow-2xl transition-transform hover:scale-[1.02]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LINE_IMAGE}
          alt="南一書局 LINE 好友募集"
          className="w-[260px]"
        />
      </a>
    </div>
  );
}
