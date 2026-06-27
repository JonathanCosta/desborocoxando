import { useState, useCallback } from 'react'
import { Droplets, Calendar, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useAppData } from './hooks/useAppData'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import Analytics from './components/Analytics'
import Settings from './components/Settings'

type Tab = 'dashboard' | 'calendar' | 'analytics' | 'settings'

const tabs: { id: Tab; label: string; icon: typeof Droplets }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Droplets },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const { db, selectedDate, setSelectedDate, getCurrentRecord, updateRecord } = useAppData()

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setActiveTab('dashboard')
  }, [setSelectedDate])

  return (
    <div className="w-full min-h-screen max-w-md mx-auto bg-[#F7F5F0] flex flex-col relative pb-20 shadow-xl border-x border-gray-200/50">
      {/* Header - Logo minimalista */}
      <header className="py-6 flex justify-center">
        <img
          src="/logo-transparente.png"
          alt="Desborocoxando"
          className="h-16 w-auto object-contain"
        />
      </header>

      {/* Active screen */}
      <main className="flex-1 px-4">
        {activeTab === 'dashboard' && (
          <Dashboard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getCurrentRecord={getCurrentRecord}
            updateRecord={updateRecord}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            db={db}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics db={db} />
        )}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-[#EBE1C6] border-t border-[#81785A]/20 flex items-center justify-around px-4 z-40"
        aria-label="Navegação principal"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-label={label}
              className={`flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all duration-300 ease-in-out ${
                isActive ? 'text-[#C496A1]' : 'text-[#81785A]/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div
                className={`w-1 h-1 rounded-full transition-all duration-300 ease-in-out ${
                  isActive ? 'bg-[#C496A1] opacity-100' : 'bg-transparent opacity-0'
                }`}
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
