import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useCalendarEvents } from '../../hooks/useCalendar'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarPage() {
  const { data: events = [], isLoading, isError } = useCalendarEvents()

  // State for selected month/year
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Helper: number of days in a month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  // Helper: start day index (0 = Sun, 6 = Sat)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayIndex = getFirstDayOfMonth(year, month)

  // Previous month padding days
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
  const prevMonthPadding = Array.from(
    { length: firstDayIndex },
    (_, i) => daysInPrevMonth - firstDayIndex + 1 + i
  )

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Next month padding days to complete 42 cells (6 rows * 7 columns)
  const remainingCells = 42 - (prevMonthPadding.length + currentMonthDays.length)
  const nextMonthPadding = Array.from({ length: remainingCells }, (_, i) => i + 1)

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Format date to local YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }

  // Get events on a specific date string
  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date.startsWith(dateStr))
  }

  // Handle day click
  const handleDayClick = (day: number, offset: 'prev' | 'curr' | 'next') => {
    if (offset === 'prev') {
      const d = new Date(prevYear, prevMonth, day)
      setCurrentDate(d)
      setSelectedDate(d)
    } else if (offset === 'next') {
      const nextM = month === 11 ? 0 : month + 1
      const nextY = month === 11 ? year + 1 : year
      const d = new Date(nextY, nextM, day)
      setCurrentDate(d)
      setSelectedDate(d)
    } else {
      setSelectedDate(new Date(year, month, day))
    }
  }

  // Determine selected day events
  const selectedDateStr = selectedDate ? formatDateString(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : ''
  const selectedEvents = selectedDate ? getEventsForDate(selectedDateStr) : []

  // Month labels
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <DashboardShell title="Interactive Schedule & Calendar">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Course Calendar & Schedule Grid</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Consolidated chronological view of assignments, announcements, and module releases across all enrolled courses.
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button size="sm" variant="secondary" onClick={handleToday} className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
              Today
            </Button>
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 border border-gray-200 dark:border-slate-700">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Previous Month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="px-3 text-sm font-bold text-gray-800 dark:text-slate-200 min-w-[120px] text-center">
                {monthName} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Next Month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid & Sidebar Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Month Cell Grid (3 cols on large screen) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-800">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2 animate-pulse py-12">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-50 dark:bg-slate-850 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-red-500 font-medium">Failed to load calendar events.</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Previous month padding days */}
                {prevMonthPadding.map((day, idx) => {
                  const dateStr = formatDateString(prevYear, prevMonth, day)
                  const dayEvents = getEventsForDate(dateStr)
                  const isDaySelected = selectedDate && 
                    selectedDate.getFullYear() === prevYear && 
                    selectedDate.getMonth() === prevMonth && 
                    selectedDate.getDate() === day

                  return (
                    <button
                      key={`prev-${day}-${idx}`}
                      onClick={() => handleDayClick(day, 'prev')}
                      className={`aspect-square p-2 rounded-xl text-left flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-slate-800/40 group border transition-all text-gray-300 dark:text-slate-655 cursor-pointer ${
                        isDaySelected ? 'border-indigo-500 ring-2 ring-indigo-950 bg-indigo-500/10' : 'border-transparent'
                      }`}
                    >
                      <span className="text-xs font-semibold">{day}</span>
                      
                      {/* Dots row */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                e.type === 'ASSIGNMENT' ? 'bg-red-400' : e.type === 'ANNOUNCEMENT' ? 'bg-emerald-400' : 'bg-blue-400'
                              }`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 leading-none">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}

                {/* Current month days */}
                {currentMonthDays.map((day) => {
                  const dateStr = formatDateString(year, month, day)
                  const dayEvents = getEventsForDate(dateStr)
                  const isDaySelected = selectedDate && 
                    selectedDate.getFullYear() === year && 
                    selectedDate.getMonth() === month && 
                    selectedDate.getDate() === day

                  const today = new Date()
                  const isToday = today.getFullYear() === year && 
                    today.getMonth() === month && 
                    today.getDate() === day

                  return (
                    <button
                      key={`curr-${day}`}
                      onClick={() => handleDayClick(day, 'curr')}
                      className={`aspect-square p-2.5 rounded-xl text-left flex flex-col justify-between border transition-all cursor-pointer relative ${
                        isDaySelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-950 bg-indigo-500/20' 
                          : 'border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isToday ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center -m-1 font-extrabold shadow-sm' : 'text-gray-700 dark:text-slate-200'}`}>
                          {day}
                        </span>
                      </div>

                      {/* Dots row */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                e.type === 'ASSIGNMENT' ? 'bg-red-500' : e.type === 'ANNOUNCEMENT' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              title={`${e.type}: ${e.title}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] font-bold text-gray-500 dark:text-slate-400 leading-none">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}

                {/* Next month padding days */}
                {nextMonthPadding.map((day, idx) => {
                  const nextM = month === 11 ? 0 : month + 1
                  const nextY = month === 11 ? year + 1 : year
                  const dateStr = formatDateString(nextY, nextM, day)
                  const dayEvents = getEventsForDate(dateStr)
                  const isDaySelected = selectedDate && 
                    selectedDate.getFullYear() === nextY && 
                    selectedDate.getMonth() === nextM && 
                    selectedDate.getDate() === day

                  return (
                    <button
                      key={`next-${day}-${idx}`}
                      onClick={() => handleDayClick(day, 'next')}
                      className={`aspect-square p-2 rounded-xl text-left flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-slate-800/40 group border transition-all text-gray-300 dark:text-slate-655 cursor-pointer ${
                        isDaySelected ? 'border-indigo-500 ring-2 ring-indigo-950 bg-indigo-500/10' : 'border-transparent'
                      }`}
                    >
                      <span className="text-xs font-semibold">{day}</span>
                      
                      {/* Dots row */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                e.type === 'ASSIGNMENT' ? 'bg-red-400' : e.type === 'ANNOUNCEMENT' ? 'bg-emerald-400' : 'bg-blue-400'
                              }`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 leading-none">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Legend row */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 dark:text-slate-400 pt-3 border-t border-gray-100 dark:border-slate-800 justify-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Assignments Due
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Announcements Posted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Module Content Releases
              </span>
            </div>
          </div>

          {/* Sidebar Drawer Day Inspector (1 col) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[400px] transition-colors">
            <div>
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Day Inspector</h3>
                <p className="text-base font-extrabold text-gray-800 dark:text-white mt-1">
                  {selectedDate?.toLocaleDateString('default', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl text-gray-250 dark:text-slate-800 mb-3">📅</div>
                  <p className="text-sm text-gray-400 dark:text-slate-550 font-medium">No events scheduled for this day.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {selectedEvents.map((e) => {
                    const badgeVariantMap = {
                      ASSIGNMENT: 'danger' as const,
                      ANNOUNCEMENT: 'success' as const,
                      MODULE: 'info' as const,
                    }
                    const badgeLabelMap = {
                      ASSIGNMENT: '📝 Assignment',
                      ANNOUNCEMENT: '📢 Alert',
                      MODULE: '📦 Module',
                    }

                    return (
                      <div key={e.id} className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2 hover:bg-gray-100/50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex justify-between items-start gap-1">
                          <Badge variant={badgeVariantMap[e.type]}>{badgeLabelMap[e.type]}</Badge>
                          <span className="text-[10px] text-gray-400 dark:text-slate-550 font-bold uppercase">{e.courseCode}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{e.title}</h4>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">{e.courseName}</div>
                        
                        {e.link && (
                          <div className="pt-1.5">
                            <Link to={e.link} className="w-full block">
                              <Button size="sm" variant="ghost" className="w-full text-xs font-bold py-1 dark:text-indigo-400 dark:hover:bg-slate-700">
                                View Details →
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
              Click any cell in the monthly grid to inspect scheduled course entries.
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
