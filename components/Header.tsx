
import React from 'react';
import { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <svg className="w-8 h-8 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">AI Travel & Media Toolkit</h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-4 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
          <NavButton label="Travel Guide" isActive={activeTab === Tab.TRAVEL_GUIDE} onClick={() => setActiveTab(Tab.TRAVEL_GUIDE)} />
          <NavButton label="Image Editor" isActive={activeTab === Tab.IMAGE_EDITOR} onClick={() => setActiveTab(Tab.IMAGE_EDITOR)} />
          <NavButton label="Audio Transcriber" isActive={activeTab === Tab.AUDIO_TRANSCRIBER} onClick={() => setActiveTab(Tab.AUDIO_TRANSCRIBER)} />
        </nav>
      </div>
    </header>
  );
};
