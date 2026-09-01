import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CalendarPlus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import EventSkeleton from '../components/events/EventSkeleton';
import Pagination from '../components/ui/Pagination';

const EventsList: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'hosting' | 'attending'>(
    () => (sessionStorage.getItem('eventsListCategory') as any) || 'all'
  );
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>(
    () => (sessionStorage.getItem('eventsListTimeframe') as any) || 'upcoming'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Persist filters across navigations
  useEffect(() => {
    sessionStorage.setItem('eventsListCategory', category);
  }, [category]);

  useEffect(() => {
    sessionStorage.setItem('eventsListTimeframe', timeframe);
  }, [timeframe]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        category: category,
        timeframe: timeframe,
      });
      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      const response = await api.get(`/events?${queryParams.toString()}`);

      setEvents(response.data.data);
      setTotalPages(response.data.data.length === limit ? page + 1 : page);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, timeframe, user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 className="page-title mt-mobile">My Events</h1>
          <p className="text-muted">Discover new events and manage your own.</p>
        </div>
        <Link to="/events/create" className="desktop-only" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: 'auto' }}>
            <CalendarPlus size={20} style={{ marginRight: '8px' }} />
            Create Event
          </button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search events by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', margin: 0, backgroundColor: 'var(--shadow-color)' }}
          />
        </div>

        {/* Tabs row */}
        <div className="tabs-row-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
          
          {/* Category tabs: All · Hosting · Attending */}
          <div className="w-full-mobile" style={{
            display: 'flex',
            backgroundColor: 'var(--overlay-light)',
            borderRadius: '20px',
            padding: '3px',
            gap: '2px',
            border: '1px solid var(--border-color)',
            flex: '1 1 auto',
          }}>
            {([['all', 'All'], ['hosting', 'Hosting'], ['attending', 'Attending']] as const).map(([cat, label]) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  backgroundColor: category === cat ? 'var(--primary-color)' : 'transparent',
                  color: category === cat ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Upcoming / Past toggle */}
          <div className="w-full-mobile" style={{
            display: 'flex',
            backgroundColor: 'var(--overlay-light)',
            borderRadius: '20px',
            padding: '3px',
            gap: '2px',
            border: '1px solid var(--border-color)',
            flex: '0 1 auto',
          }}>
            {(['upcoming', 'past'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setPage(1); }}
                style={{
                  flex: 1,
                  padding: '6px 18px',
                  borderRadius: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  backgroundColor: timeframe === tf ? 'var(--primary-color)' : 'transparent',
                  color: timeframe === tf ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Event Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <EventSkeleton key={n} />)}
        </div>
      ) : events.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {events.map((event) => (
              <EventCard key={event.id} {...event} onClick={() => navigate(`/events/${event.id}`)} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        /* Empty State */
        <div className="glass-panel flex-center" style={{ padding: '64px 24px', flexDirection: 'column', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <CalendarPlus size={40} color="var(--primary-color)" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No events found</h3>
          <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '24px' }}>
            {search
              ? `We couldn't find any events matching "${search}".`
              : timeframe === 'past'
              ? 'No past events found.'
              : "You haven't created any events yet. Get started by creating your first event!"}
          </p>
          {!search && timeframe !== 'past' && (
            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/events/create')}>
              Create Your First Event
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsList;
