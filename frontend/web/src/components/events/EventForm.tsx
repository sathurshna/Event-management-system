import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Save, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

interface EventFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, isEdit = false }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '', // format for datetime-local
    location: initialData?.location || '',
    isPublic: initialData?.is_public !== undefined ? Boolean(initialData.is_public) : true,
    coverImage: initialData?.cover_image || '',
  });

  // Handle unsaved changes warning (Custom logic since React Router v6 dropped Prompt)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setIsDirty(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('coverImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title) errors.title = 'Title is required';
      if (!formData.description) errors.description = 'Description is required';
    }
    if (step === 2) {
      if (!formData.date) errors.date = 'Date is required';
      if (!formData.location) errors.location = 'Location is required';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) return toast.error('Missing required fields');

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(), // UTC for backend
        location: formData.location,
        isPublic: Boolean(formData.isPublic),
        coverImage: formData.coverImage,
      };

      if (isEdit && initialData?.id) {
        await api.put(`/events/${initialData.id}`, payload);
        toast.success('Event updated successfully!');
        setIsDirty(false);
        navigate(`/events/${initialData.id}`);
      } else {
        const response = await api.post('/events', payload);
        toast.success('Event created successfully!');
        setIsDirty(false);
        navigate(`/events/${response.data.data.id}`);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors && errorData.errors.length > 0) {
        const errors: Record<string, string> = {};
        errorData.errors.forEach((err: any) => {
          if (err.path && err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setFieldErrors(errors);
        toast.error('Please fix the errors before submitting');
      } else {
        toast.error(errorData?.message || 'Failed to save event');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
      {/* Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="flex-center"
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: step >= s ? 'var(--primary-color)' : 'var(--surface-color)',
              border: step >= s ? 'none' : '2px solid var(--border-color)',
              color: step >= s ? 'var(--text-main)' : 'var(--text-muted)',
              zIndex: 1,
              fontWeight: 'bold'
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
        {step === 1 ? 'Basic Info' : step === 2 ? 'Date & Location' : 'Settings & Image'}
      </h2>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Event Title *</label>
            <input
              className={`input-field ${fieldErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="E.g., Tech Startup Mixer"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            {fieldErrors.title && <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Description *</label>
            <textarea
              className={`input-field ${fieldErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="What is this event about?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
              required
            />
            {fieldErrors.description && <p className="text-red-500 text-sm mt-1">{fieldErrors.description}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Date & Location */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Date & Time *</label>
            {/* Custom styled datetime-local picker */}
            <input
              type="datetime-local"
              className={`input-field ${fieldErrors.date ? 'border-red-500 focus:border-red-500' : ''}`}
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
            {fieldErrors.date && <p className="text-red-500 text-sm mt-1">{fieldErrors.date}</p>}
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Location / Venue *</label>
            <input
              className={`input-field ${fieldErrors.location ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="Full address or meeting link"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
            {fieldErrors.location && <p className="text-red-500 text-sm mt-1">{fieldErrors.location}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Settings & Image */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Visibility</label>
            <select
              className="input-field"
              value={formData.isPublic ? 'true' : 'false'}
              onChange={(e) => handleChange('isPublic', e.target.value === 'true')}
            >
              <option value="true">Public (Anyone can see and RSVP)</option>
              <option value="false">Private (Only you and invited guests)</option>
            </select>
          </div>

          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Cover Image (Upload or URL)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  className="btn-primary"
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'auto'
                  }}
                >
                  <ImageIcon size={18} />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span className="text-muted" style={{ fontSize: '12px' }}>OR</span>
              </div>
              <input
                className="input-field"
                placeholder="Or paste an image URL (https://images.unsplash.com/...)"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
              />
            </div>

            {/* Cover Image Preview */}
            <div
              className="flex-center"
              style={{
                marginTop: '16px', height: '180px', borderRadius: 'var(--radius-md)',
                border: '2px dashed var(--border-color)', overflow: 'hidden',
                backgroundColor: 'var(--shadow-color)'
              }}
            >
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={32} style={{ marginBottom: '8px' }} />
                  <span>Image Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <button
          className="btn-primary"
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          style={{ width: 'auto', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', opacity: step === 1 ? 0 : 1 }}
        >
          <ChevronLeft size={18} style={{ marginRight: '8px' }} /> Back
        </button>

        {step < 3 ? (
          <button className="btn-primary" onClick={nextStep} style={{ width: 'auto' }}>
            Next <ChevronRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting} style={{ width: 'auto', backgroundColor: 'var(--secondary-color)' }}>
            <Save size={18} style={{ marginRight: '8px' }} />
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventForm;
