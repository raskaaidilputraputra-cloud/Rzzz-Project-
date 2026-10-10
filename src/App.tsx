/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { PhotoEnhancer } from './components/PhotoEnhancer.tsx';
import { VideoEnhancer } from './components/VideoEnhancer.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { ApiStatusView } from './components/ApiStatusView.tsx';
import { EnhanceResult } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video' | 'history' | 'status'>('home');
  const [history, setHistory] = useState<EnhanceResult[]>([]);
  const [selectedSampleUrl, setSelectedSampleUrl] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rzzhd_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  const handleSaveToHistory = (newItem: EnhanceResult) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((item) => item.id !== newItem.id)];
      try {
        localStorage.setItem('rzzhd_history', JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('rzzhd_history');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('rzzhd_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update localStorage:', e);
      }
      return updated;
    });
  };

  const handleSelectSampleFromHome = (url: string) => {
    setSelectedSampleUrl(url);
    setActiveTab('photo');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top and Mobile Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onSelectTab={setActiveTab}
            onSelectSamplePhoto={handleSelectSampleFromHome}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoEnhancer
            onSaveToHistory={handleSaveToHistory}
            initialImageUrl={selectedSampleUrl}
          />
        )}

        {activeTab === 'video' && <VideoEnhancer />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onNavigateToPhoto={() => setActiveTab('photo')}
          />
        )}

        {activeTab === 'status' && <ApiStatusView />}
      </main>
    </div>
  );
}
