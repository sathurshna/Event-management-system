import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar as CalendarIcon, MapPin, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  is_public: boolean;
  host_id: string;
  location?: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [title, setTitle] = useState('');
  const calendarRef = useRef<FullCalendar>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events?limit=1000&category=calendar');
        setEvents(response.data.data);
      } catch (error) {
        console.error('Failed to fetch events for calendar', error);
      }
    };
    fetchEvents();
  }, []);

  const getEventColor = (event: EventData) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Past events = Bright Gray
    if (eventDate < now) return '#9ca3af'; 
    // Public events = Yellow
    if (event.is_public) return '#facc15'; 
    // Private events = Magenta
    return '#e879f9'; 
  };

  const calendarEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.date,
    end: e.end_date || e.date,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    extendedProps: { ...e, indicatorColor: getEventColor(e) }
  }));

  const handleEventClick = (info: any) => {
    const eventObj = info.event.extendedProps;
    setSelectedEvent(eventObj as EventData);
    setSidebarOpen(true);
  };

  const handleDateClick = (info: any) => {
    setSelectedEvent(null);
    setSelectedDate(info.dateStr);
    setSidebarOpen(true);
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const changeView = (view: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      setCurrentView(view);
      setTitle(api.view.title);
    }
  };

  const navigateCalendar = (action: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi();
    if (api) {
      if (action === 'prev') api.prev();
      if (action === 'next') api.next();
      if (action === 'today') api.today();
      setTitle(api.view.title);
    }
  };

  // Set initial title when calendar is ready
  useEffect(() => {
    if (calendarRef.current) {
      setTitle(calendarRef.current.getApi().view.title);
    }
  }, [calendarRef.current]);

  const dateEvents = events.filter(e => {
    const eDate = new Date(e.date);
    const dDate = new Date(selectedDate);
    return eDate.getFullYear() === dDate.getFullYear() && 
           eDate.getMonth() === dDate.getMonth() && 
           eDate.getDate() === dDate.getDate();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Custom Top Toolbar */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => navigate('/events/create')}>
            <Plus size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '4px' }}>
          {[
            { id: 'timeGridDay', label: 'Day' },
            { id: 'timeGridWeek', label: 'Week' },
            { id: 'dayGridMonth', label: 'Month' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => changeView(view.id)}
              style={{
                background: currentView === view.id ? 'rgba(255,255,255,0.15)' : 'none',
                border: 'none',
                color: currentView === view.id ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '6px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: currentView === view.id ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
        
        {/* Placeholder for right alignment balance */}
        <div style={{ width: 36 }}></div>
      </div>

      {/* Calendar Header with Title and Navigation */}
      <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', margin: 0, fontWeight: '800', letterSpacing: '-0.025em' }}>
          <span style={{ background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title.split(' ')[0]}</span> <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>{title.split(' ')[1]}</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigateCalendar('prev')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => navigateCalendar('today')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '16px', cursor: 'pointer' }}>
            Today
          </button>
          <button onClick={() => navigateCalendar('next')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Area */}
      <div style={{ flex: 1, padding: '24px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, height: '100%' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="100%"
            headerToolbar={false}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            dayCellClassNames={(arg) => {
              return arg.dateStr === selectedDate ? 'selected-day-tahoe' : '';
            }}
            eventContent={(eventInfo) => {
              const color = eventInfo.event.extendedProps.indicatorColor;
              return (
                <div style={{ display: 'flex', alignItems: 'center', padding: '2px 4px', overflow: 'hidden' }}>
                  <div style={{ width: '4px', height: '14px', borderRadius: '2px', backgroundColor: color, marginRight: '6px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.9em', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eventInfo.timeText && <strong style={{marginRight: '4px', color: 'var(--text-muted)'}}>{eventInfo.timeText}</strong>}
                    {eventInfo.event.title}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Slide-in Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Slide-in Sidebar (details/create) */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--surface-color-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', paddingRight: '16px' }}>
            {selectedEvent ? selectedEvent.title : (selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Events')}
          </h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>
        
        {selectedEvent ? (
          <>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <CalendarIcon size={20} className="text-primary" />
                <span style={{ color: 'var(--text-main)' }}>{formatEventDate(selectedEvent.date)}</span>
              </div>
              
              {selectedEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <MapPin size={20} className="text-primary" />
                  <span style={{ color: 'var(--text-main)' }}>{selectedEvent.location}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <Users size={20} className="text-primary" />
                <span style={{ color: 'var(--text-main)' }}>
                  {selectedEvent.is_public ? 'Public Event' : 'Private Event'}
                  {selectedEvent.host_id === user?.userId && ' (You are hosting)'}
                </span>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => navigate(`/events/${selectedEvent.id}`)}
              >
                View Full Details
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {dateEvents.length > 0 ? (
              dateEvents.map(e => (
                <div 
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '16px',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getEventColor(e)}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(ev) => ev.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseOut={(ev) => ev.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>{e.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <CalendarIcon size={14} />
                    <span>{new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted" style={{ lineHeight: 1.5, textAlign: 'center', marginTop: '24px' }}>
                No events scheduled for this day.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default CalendarView;
