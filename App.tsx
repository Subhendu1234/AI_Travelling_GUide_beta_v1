
import React, { useState } from 'react';
import { TravelGuideGenerator } from './components/TravelGuideGenerator';
import { ImageEditor } from './components/ImageEditor';
import { AudioTranscriber } from './components/AudioTranscriber';
import { Header } from './components/Header';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TRAVEL_GUIDE);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.TRAVEL_GUIDE:
        return <TravelGuideGenerator />;
      case Tab.IMAGE_EDITOR:
        return <ImageEditor />;
      case Tab.AUDIO_TRANSCRIBER:
        return <AudioTranscriber />;
      default:
        return <TravelGuideGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
