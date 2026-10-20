"use client"

import { useState } from "react"
import Link from "next/link"

export default function LandingClient() {
  const [showDemoModal, setShowDemoModal] = useState(false)

  return (
    <>
      {/* Hero Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" id="book-demo">
        <Link 
          href="/login" 
          className="w-full sm:w-auto px-8 py-4 bg-primary-gradient text-white font-bold text-sm rounded-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>Deploy Complihub</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
        
        <button 
          onClick={() => setShowDemoModal(true)}
          className="w-full sm:w-auto px-8 py-4 bg-surface-container-lowest text-primary border border-outline-variant/20 font-bold text-sm rounded-lg shadow-sm hover:bg-white transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">play_circle</span>
          <span>View Platform Demo</span>
        </button>
      </div>

      {/* Video Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#1e2a3b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141d29]">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-bold text-white ml-2">Complihub Platform Walkthrough</span>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video 
                src="/complihub-demo.webm" 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#141d29] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-300">
              <p>Demonstrating Dashboard KPIs, Compliance Calendar, Task Allocation, and Statutory Filing.</p>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition-all text-xs"
              >
                Try Live Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
