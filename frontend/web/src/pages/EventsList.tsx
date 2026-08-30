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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Assuming 1 page for now as backend doesn't return total count yet
  const limit = 6;

  // Persist category state across navigations
  useEffect(() => {
    sessionStorage.setItem('eventsListCategory', category);
  }, [category]);

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
  }, [page, debouncedSearch, category, user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Events Dashboard</h1>
          <p className="text-muted">Discover new events and manage your own.</p>
        </div>
        <Link to="/events/create" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: 'auto' }}>
            <CalendarPlus size={20} style={{ marginRight: '8px' }} />
            Create Event
          </button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {([['all', 'Discovery (All Public)'], ['hosting', 'Hosting'], ['attending', 'Attending']] as const).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: category === cat ? 'var(--primary-color)' : 'var(--overlay-light)',
                color: category === cat ? 'var(--text-main)' : 'var(--text-muted)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <EventSkeleton key={n} />)}
        </div>
      ) : events.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
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
            {search ? `We couldn't find any events matching "${search}".` : "You haven't created any events yet. Get started by creating your first event!"}
          </p>
          {!search && (
            <button className="btn-primary" style={{ width: 'auto' }}>
              Create Your First Event
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsList;
