import { useState, useEffect, useMemo } from 'react';
import {
  CheckIcon,
  StarIcon,
  SpinnerIcon,
  LockIcon,
  ShieldIcon,
  TrashIcon,
  RefreshIcon,
  SearchIcon,
  AlertTriangleIcon,
  ContactIcon,
  MailIcon,
  CopyIcon,
  ExternalLinkIcon,
  CloseIcon
} from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function EmailReplyModal({ contact, onClose, onStatusUpdated }) {
  const [subject, setSubject] = useState(`Re: ${contact.subject} (SignSpeak Support)`);
  const [replyBody, setReplyBody] = useState(
    `Hi ${contact.name},\n\nThank you for reaching out to the SignSpeak accessibility team regarding "${contact.subject}".\n\n`
  );
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fullEmailContent = `${replyBody}\n\nBest regards,\nSignSpeak Support & Engineering Team\nhttps://signspeak.org\n\n----------------------------------------\nOriginal Inquiry from ${contact.name} (${contact.email}):\n"${contact.message}"`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    contact.email
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullEmailContent)}`;

  async function handleMarkReplied() {
    setUpdating(true);
    try {
      await api.updateAdminContact(contact.id, { status: 'replied' });
      if (onStatusUpdated) onStatusUpdated(contact.id, 'replied');
    } catch (e) {
      console.warn('Failed to update status:', e);
    } finally {
      setUpdating(false);
    }
  }

  async function handleOpenGmail() {
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    await handleMarkReplied();
  }

  async function handleCopyContent() {
    try {
      await navigator.clipboard.writeText(
        `To: ${contact.email}\nSubject: ${subject}\n\n${fullEmailContent}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      await handleMarkReplied();
    } catch (e) {
      alert('Failed to copy: ' + e.message);
    }
  }

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal email-reply-modal" role="dialog" aria-modal="true">
        <button className="close-auth" type="button" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={16} />
        </button>

        <div className="auth-modal-content-wrap">
          <div className="reply-modal-head">
            <div className="admin-eyebrow-pill">
              <MailIcon size={13} />
              <span>COMPOSE EMAIL REPLY</span>
            </div>
            <h3>Reply to {contact.name}</h3>
            <p className="reply-recipient-line">
              Recipient: <strong>{contact.email}</strong>
            </p>
          </div>

          <div className="reply-form-fields">
            <div className="field auth-field">
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-with-icon"
              />
            </div>

            <div className="field auth-field">
              <label>Your Message</label>
              <textarea
                rows={5}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your email response..."
                className="reply-textarea"
              />
            </div>

            <div className="reply-quoted-inquiry">
              <span className="quote-label">Original User Inquiry:</span>
              <p className="quote-text">"{contact.message}"</p>
            </div>

            <div className="reply-actions-grid reply-actions-two-btn">
              <button
                type="button"
                className="btn btn-primary reply-action-btn gmail-btn"
                onClick={handleOpenGmail}
                title="Open and send in Gmail"
              >
                <ExternalLinkIcon size={14} />
                <span>Open in Gmail</span>
              </button>

              <button
                type="button"
                className="btn btn-outline reply-action-btn copy-btn"
                onClick={handleCopyContent}
                title="Copy drafted email"
              >
                {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline reply-action-btn mark-replied-btn"
                onClick={async () => {
                  await handleMarkReplied();
                  onClose();
                }}
                disabled={updating}
                title="Mark as Replied in database"
              >
                <CheckIcon size={14} />
                <span>Mark Replied</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadJSON(filename, object) {
  const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function storeLocal(key, entry) {
  try {
    const values = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...values, entry]));
  } catch (e) {
    console.warn('[LocalStorage] Could not write cache:', e);
  }
}

function Success({ title, message, subtext, onReset }) {
  return (
    <div className="successbox show">
      <div className="check">
        <CheckIcon size={20} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {subtext && <p className="saved-note">{subtext}</p>}
      {onReset && (
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: '16px', fontSize: '13px', padding: '6px 16px' }}
          onClick={onReset}
        >
          Submit Another Response
        </button>
      )}
    </div>
  );
}

export function AuthRequiredGate({ onOpenAuth, title, desc }) {
  return (
    <div className="auth-gate-card">
      <div className="auth-gate-emblem">
        <LockIcon size={24} />
      </div>
      <h3>{title || 'Sign In Required'}</h3>
      <p>{desc || 'Please sign in or create an account to access this feature and submit your message.'}</p>
      <button
        type="button"
        className="btn btn-primary auth-gate-action-btn"
        onClick={onOpenAuth}
      >
        <span>Sign In to Continue</span>
        <span>→</span>
      </button>
    </div>
  );
}

const contactRules = {
  subject: (value) => (value ? '' : 'Please choose a subject.'),
  message: (value) =>
    value.trim().length < 10
      ? 'Message should be at least 10 characters.'
      : value.trim().length > 2000
      ? 'Message must be 2000 characters or fewer.'
      : ''
};

export function ContactForm({ onOpenAuth }) {
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  // Admin Inbound Telemetry State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminContacts, setAdminContacts] = useState([]);
  const [adminViewMode, setAdminViewMode] = useState('feed'); // 'feed' | 'compose'
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'STARRED'
  const [deletingId, setDeletingId] = useState(null);
  const [replyingContact, setReplyingContact] = useState(null);

  const userName = profile?.display_name || user?.displayName || 'SignSpeak User';
  const userEmail = profile?.email || user?.email || '';

  const [values, setValues] = useState({
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Check if current user has administrator permissions
  useEffect(() => {
    if (user) {
      checkAdminAccess();
    } else {
      setIsAdmin(false);
      setAdminContacts([]);
    }
  }, [user]);

  async function checkAdminAccess() {
    setAdminLoading(true);
    try {
      const contactsData = await api.getAdminContacts();
      setIsAdmin(true);
      setAdminContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleDeleteContact(id) {
    if (!window.confirm('Are you sure you want to permanently delete this contact submission?')) return;
    setDeletingId(id);
    try {
      await api.deleteAdminContact(id);
      setAdminContacts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete contact: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  }

  // Toggle Starred state
  async function handleToggleStar(item, e) {
    e.stopPropagation();
    const nextStarred = !item.is_starred;
    setAdminContacts((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_starred: nextStarred } : c))
    );
    try {
      await api.updateAdminContact(item.id, { is_starred: nextStarred });
    } catch (err) {
      console.warn('Failed to update star:', err);
    }
  }

  // Toggle Read / Unread state
  async function handleToggleRead(item, e) {
    if (e) e.stopPropagation();
    const nextStatus = item.status === 'unread' ? 'read' : 'unread';
    setAdminContacts((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, status: nextStatus } : c))
    );
    try {
      await api.updateAdminContact(item.id, { status: nextStatus });
    } catch (err) {
      console.warn('Failed to update status:', err);
    }
  }

  // Auto-mark as read when user clicks to inspect/view
  function handleCardClick(item) {
    if (item.status === 'unread') {
      handleToggleRead(item);
    }
  }

  if (!user) {
    return (
      <AuthRequiredGate
        onOpenAuth={onOpenAuth}
        title="Sign In Required to Contact Us"
        desc="Please sign in with your account to send a message to our accessibility and engineering team."
      />
    );
  }

  function validateField(field, value) {
    return contactRules[field](value);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    }
  }

  function markTouched(event) {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  }

  async function submit(event) {
    event.preventDefault();
    setServerError('');
    const nextErrors = Object.fromEntries(
      Object.keys(contactRules).map((field) => [field, validateField(field, values[field])])
    );
    setTouched({ subject: true, message: true });
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    const payload = {
      name: userName,
      email: userEmail,
      subject: values.subject,
      message: values.message,
      timestamp: new Date().toISOString()
    };

    try {
      await api.submitContact(payload);
      storeLocal('signspeak_contacts', payload);
      setSent(true);
      if (isAdmin) {
        checkAdminAccess();
      }
    } catch (err) {
      console.warn('[ContactForm] Server submission warning:', err.message);
      storeLocal('signspeak_contacts', payload);
      downloadJSON(`signspeak-contact-${Date.now()}.json`, payload);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = Object.keys(contactRules).every((field) => !contactRules[field](values[field]));

  // Counters for filter pills
  const unreadCount = useMemo(() => adminContacts.filter((c) => c.status === 'unread').length, [adminContacts]);
  const starredCount = useMemo(() => adminContacts.filter((c) => c.is_starred).length, [adminContacts]);

  // Filtered contacts for admin view
  const filteredContacts = useMemo(() => {
    return adminContacts.filter((item) => {
      const matchesSearch =
        !adminSearch ||
        (item.name && item.name.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(adminSearch.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNREAD' && item.status === 'unread') ||
        (statusFilter === 'STARRED' && item.is_starred);

      return matchesSearch && matchesStatus;
    });
  }, [adminContacts, adminSearch, statusFilter]);

  // If user is Administrator and viewing admin feed
  if (isAdmin && adminViewMode === 'feed') {
    return (
      <div className="admin-form-feed-wrapper">
        {/* Admin Header Ribbon */}
        <div className="admin-inline-banner">
          <div className="admin-banner-text">
            <h3>Inbound Contact Submissions ({adminContacts.length})</h3>
            <p>Live database records of users who requested contact or support.</p>
          </div>

          <div className="admin-banner-controls">
            <button
              type="button"
              className="btn btn-outline mini-btn"
              onClick={checkAdminAccess}
              disabled={adminLoading}
              title="Refresh database records"
            >
              <RefreshIcon size={14} className={adminLoading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Top Filters: All / Unread / Starred */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrap">
            <SearchIcon size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search contacts by name, email, subject, or message..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="admin-search-input"
            />
            {adminSearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setAdminSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="rating-filter-pills status-filter-pills">
            <button
              type="button"
              className={`rating-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({adminContacts.length})
            </button>
            <button
              type="button"
              className={`rating-pill unread-pill ${statusFilter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNREAD')}
            >
              <span className="pill-dot unread" /> Unread ({unreadCount})
            </button>
            <button
              type="button"
              className={`rating-pill starred-pill ${statusFilter === 'STARRED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('STARRED')}
            >
              <StarIcon size={13} filled={statusFilter === 'STARRED'} /> Starred ({starredCount})
            </button>
          </div>
        </div>

        {/* List of Inbound Messages */}
        {adminLoading && adminContacts.length === 0 ? (
          <div className="admin-loading-state">
            <SpinnerIcon size={28} />
            <p>Fetching inbound contacts from Neon...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="admin-empty-state">
            <ContactIcon size={32} />
            <h3>No Contact Inquiries Found</h3>
            <p>{adminSearch || statusFilter !== 'ALL' ? 'No messages match your active filters.' : 'Submitted inquiries from users will appear here in real time.'}</p>
          </div>
        ) : (
          <div className="admin-cards-grid">
            {filteredContacts.map((item) => {
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : 'Recently';

              const initial = (item.name || item.email || 'C').charAt(0).toUpperCase();
              const isUnread = item.status === 'unread';

              return (
                <div
                  key={item.id}
                  className={`admin-record-card contact-card ${isUnread ? 'unread-card-highlight' : ''}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="record-card-head">
                    <div className="record-user-meta">
                      {/* Star Button */}
                      <button
                        type="button"
                        className={`item-star-btn ${item.is_starred ? 'starred' : ''}`}
                        onClick={(e) => handleToggleStar(item, e)}
                        title={item.is_starred ? 'Unstar inquiry' : 'Star inquiry'}
                      >
                        <StarIcon size={16} filled={item.is_starred} />
                      </button>

                      <div className="record-avatar-badge contact-badge">
                        <span>{initial}</span>
                      </div>
                      <div className="record-user-text">
                        <div className="user-name-title-row">
                          <strong>{item.name}</strong>
                          {isUnread && <span className="unread-pulse-badge">NEW</span>}
                        </div>
                        <a href={`mailto:${item.email}`} className="record-email-link" onClick={(e) => e.stopPropagation()}>
                          {item.email}
                        </a>
                      </div>
                    </div>

                    <div className="record-subject-pill">
                      <span>{item.subject}</span>
                    </div>
                  </div>

                  <div className="contact-message-box">
                    <p className="record-message-text">{item.message}</p>
                  </div>

                  <div className="record-card-foot">
                    <div className="foot-meta-details">
                      <span className="record-date-tag">{dateStr}</span>
                      <span className={`status-indicator-tag status-${item.status}`}>
                        {item.status || 'Received'}
                      </span>
                    </div>

                    <div className="contact-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-mark-read-toggle"
                        onClick={(e) => handleToggleRead(item, e)}
                        title={isUnread ? 'Mark as read' : 'Mark as unread'}
                      >
                        {isUnread ? 'Mark Read' : 'Mark Unread'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline mini-reply-btn"
                        onClick={() => {
                          if (isUnread) handleToggleRead(item);
                          setReplyingContact(item);
                        }}
                        title="Compose email reply in Gmail"
                      >
                        <MailIcon size={13} />
                        <span>Reply via Email</span>
                      </button>

                      <button
                        type="button"
                        className="btn-delete-record"
                        onClick={() => handleDeleteContact(item.id)}
                        disabled={deletingId === item.id}
                        title="Delete submission"
                      >
                        {deletingId === item.id ? <SpinnerIcon size={14} /> : <TrashIcon size={14} />}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Email Reply Composer Modal */}
        {replyingContact && (
          <EmailReplyModal
            contact={replyingContact}
            onClose={() => setReplyingContact(null)}
            onStatusUpdated={(id, nextStatus) => {
              setAdminContacts((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
              );
            }}
          />
        )}
      </div>
    );
  }

  if (sent) {
    return (
      <Success
        title="Message Received"
        message="Thank you for reaching out! Our engineering and accessibility team will review your note."
        onReset={() => {
          setSent(false);
          setValues({ subject: '', message: '' });
          if (isAdmin) setAdminViewMode('feed');
        }}
      />
    );
  }

  const fieldProps = (field) => ({
    name: field,
    value: values[field],
    onChange: updateField,
    onBlur: markTouched,
    'aria-invalid': Boolean(touched[field] && errors[field]),
    'aria-describedby': `${field}-feedback`
  });

  return (
    <form onSubmit={submit} noValidate className="form-standard">
      {isAdmin && (
        <div className="admin-toggle-bar">
          <span className="admin-status-note">
            <ShieldIcon size={14} /> You are signed in as an Administrator
          </span>
          <button
            type="button"
            className="btn btn-outline mini-btn"
            onClick={() => setAdminViewMode('feed')}
          >
            ← View Submissions ({adminContacts.length})
          </button>
        </div>
      )}

      {serverError && <div className="form-alert-error">{serverError}</div>}

      {/* Locked Name Field */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="c-name">Your Full Name</label>
          <span className="locked-pill"><LockIcon size={12} /> Account verified</span>
        </div>
        <input
          id="c-name"
          type="text"
          value={userName}
          disabled
          className="disabled-field"
        />
        <span className="field-subnote">Locked to your signed-in account</span>
      </div>

      {/* Locked Email Field */}
      <div className="field">
        <div className="field-label-row">
          <label htmlFor="c-email">Your Email Address</label>
          <span className="locked-pill"><LockIcon size={12} /> Primary account email</span>
        </div>
        <input
          id="c-email"
          type="email"
          value={userEmail}
          disabled
          className="disabled-field"
        />
        <span className="field-subnote">Locked to your signed-in account</span>
      </div>

      <div
        className={`field ${touched.subject && errors.subject ? 'invalid' : ''} ${
          touched.subject && !errors.subject ? 'valid' : ''
        }`}
      >
        <label htmlFor="c-subject">Subject</label>
        <select id="c-subject" {...fieldProps('subject')}>
          <option value="">Select a topic</option>
          <option>General question</option>
          <option>Bug report / Detection glitch</option>
          <option>Google Meet Extension integration</option>
          <option>ASL Dictionary suggestion</option>
          <option>Partnership / Academic research</option>
        </select>
        <div className="err" id="subject-feedback" role="alert">
          {errors.subject}
        </div>
      </div>

      <div
        className={`field ${touched.message && errors.message ? 'invalid' : ''} ${
          touched.message && !errors.message ? 'valid' : ''
        }`}
      >
        <label htmlFor="c-message">
          Message <span className="field-count">{values.message.length}/2000</span>
        </label>
        <textarea
          id="c-message"
          placeholder="Tell us what's on your mind or report an issue..."
          maxLength="2000"
          {...fieldProps('message')}
        />
        <div className="err" id="message-feedback" role="alert">
          {errors.message}
        </div>
      </div>

      <button
        className="btn btn-primary form-submit-btn"
        type="submit"
        disabled={!isValid || submitting}
      >
        {submitting ? (
          <>
            <SpinnerIcon size={16} />
            <span>Sending Message...</span>
          </>
        ) : (
          <span>Send Message</span>
        )}
      </button>
    </form>
  );
}

export function FeedbackForm({ onOpenAuth }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [contactOptIn, setContactOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Admin Feedback Telemetry State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState([]);
  const [adminViewMode, setAdminViewMode] = useState('feed'); // 'feed' | 'compose'
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'STARRED'
  const [adminRatingFilter, setAdminRatingFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const userName = profile?.display_name || user?.displayName || 'SignSpeak User';
  const userEmail = profile?.email || user?.email || '';

  // Check if current user has administrator permissions
  useEffect(() => {
    if (user) {
      checkAdminAccess();
    } else {
      setIsAdmin(false);
      setAdminFeedback([]);
    }
  }, [user]);

  async function checkAdminAccess() {
    setAdminLoading(true);
    try {
      const feedbackData = await api.getAdminFeedback();
      setIsAdmin(true);
      setAdminFeedback(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleDeleteFeedback(id) {
    if (!window.confirm('Are you sure you want to permanently delete this feedback record?')) return;
    setDeletingId(id);
    try {
      await api.deleteAdminFeedback(id);
      setAdminFeedback((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete feedback: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  }

  // Toggle Starred state on feedback
  async function handleToggleStar(item, e) {
    e.stopPropagation();
    const nextStarred = !item.is_starred;
    setAdminFeedback((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, is_starred: nextStarred } : f))
    );
    try {
      await api.updateAdminFeedback(item.id, { is_starred: nextStarred });
    } catch (err) {
      console.warn('Failed to update feedback star:', err);
    }
  }

  // Toggle Read / Unread state on feedback
  async function handleToggleRead(item, e) {
    if (e) e.stopPropagation();
    const nextStatus = item.status === 'unread' ? 'read' : 'unread';
    setAdminFeedback((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus } : f))
    );
    try {
      await api.updateAdminFeedback(item.id, { status: nextStatus });
    } catch (err) {
      console.warn('Failed to update feedback status:', err);
    }
  }

  // Auto-mark as read when user clicks to view/inspect
  function handleCardClick(item) {
    if (item.status === 'unread') {
      handleToggleRead(item);
    }
  }

  if (!user) {
    return (
      <AuthRequiredGate
        onOpenAuth={onOpenAuth}
        title="Sign In Required to Send Feedback"
        desc="Please sign in with your account to submit feedback, report edge-cases, and help shape what we build next."
      />
    );
  }

  const available = [
    'Bug',
    'Feature Request',
    'Design',
    'Speech Accuracy',
    'Detection Latency',
    'Praise'
  ];
  const ratingLabels = [
    'Select a rating',
    'Needs attention',
    'Could be better',
    'Getting there',
    'Working well',
    'Excellent experience'
  ];

  async function submit(event) {
    event.preventDefault();
    if (!rating || !categories.length || message.trim().length < 10 || submitting) return;

    setSubmitting(true);
    const payload = {
      user_id: user.uid,
      display_name: userName,
      email: userEmail,
      rating,
      categories,
      message: message.trim(),
      contactOptIn,
      page: 'feedback',
      timestamp: new Date().toISOString()
    };

    try {
      await api.submitFeedback(payload);
      storeLocal('signspeak_feedback', payload);
      setSent(true);
      if (isAdmin) {
        checkAdminAccess();
      }
    } catch (err) {
      console.warn('[FeedbackForm] Server submission warning:', err.message);
      storeLocal('signspeak_feedback', payload);
      downloadJSON(`signspeak-feedback-${Date.now()}.json`, payload);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  // Counters for filter pills
  const unreadCount = useMemo(() => adminFeedback.filter((f) => f.status === 'unread').length, [adminFeedback]);
  const starredCount = useMemo(() => adminFeedback.filter((f) => f.is_starred).length, [adminFeedback]);

  // Filtered feedback for admin view
  const filteredFeedback = useMemo(() => {
    return adminFeedback.filter((item) => {
      const matchesSearch =
        !adminSearch ||
        (item.message && item.message.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.user_email && item.user_email.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (item.user_name && item.user_name.toLowerCase().includes(adminSearch.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNREAD' && item.status === 'unread') ||
        (statusFilter === 'STARRED' && item.is_starred);

      const matchesRating =
        adminRatingFilter === 'ALL' || Number(item.rating) === Number(adminRatingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [adminFeedback, adminSearch, statusFilter, adminRatingFilter]);

  // If user is Administrator and viewing admin feed
  if (isAdmin && adminViewMode === 'feed') {
    return (
      <div className="admin-form-feed-wrapper">
        {/* Admin Header Ribbon */}
        <div className="admin-inline-banner">
          <div className="admin-banner-text">
            <h3>Community Feedback Telemetry ({adminFeedback.length})</h3>
            <p>Live database records of community sentiment, star ratings, and bug reports.</p>
          </div>

          <div className="admin-banner-controls">
            <button
              type="button"
              className="btn btn-outline mini-btn"
              onClick={checkAdminAccess}
              disabled={adminLoading}
              title="Refresh database records"
            >
              <RefreshIcon size={14} className={adminLoading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter & Rating Pills: All / Unread / Starred */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrap">
            <SearchIcon size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search feedback text, email, or user name..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="admin-search-input"
            />
            {adminSearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setAdminSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="rating-filter-pills status-filter-pills">
            <button
              type="button"
              className={`rating-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({adminFeedback.length})
            </button>
            <button
              type="button"
              className={`rating-pill unread-pill ${statusFilter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNREAD')}
            >
              <span className="pill-dot unread" /> Unread ({unreadCount})
            </button>
            <button
              type="button"
              className={`rating-pill starred-pill ${statusFilter === 'STARRED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('STARRED')}
            >
              <StarIcon size={13} filled={statusFilter === 'STARRED'} /> Starred ({starredCount})
            </button>
          </div>
        </div>

        {/* Secondary Rating Filter Pills */}
        <div className="feedback-sub-filters">
          <span className="sub-filter-label">Filter by rating:</span>
          <div className="rating-filter-pills">
            {['ALL', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                type="button"
                className={`rating-pill mini-pill ${adminRatingFilter === r ? 'active' : ''}`}
                onClick={() => setAdminRatingFilter(r)}
              >
                {r === 'ALL' ? 'All ★' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* List of Community Feedback */}
        {adminLoading && adminFeedback.length === 0 ? (
          <div className="admin-loading-state">
            <SpinnerIcon size={28} />
            <p>Fetching community feedback from Neon...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="admin-empty-state">
            <StarIcon size={32} />
            <h3>No Feedback Records Found</h3>
            <p>{adminSearch || statusFilter !== 'ALL' || adminRatingFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Community feedback will appear here in real time.'}</p>
          </div>
        ) : (
          <div className="admin-cards-grid">
            {filteredFeedback.map((item) => {
              const categoriesList = Array.isArray(item.categories)
                ? item.categories
                : typeof item.categories === 'string'
                ? JSON.parse(item.categories || '[]')
                : [];

              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : 'Recently';

              const initial = (item.user_name || item.user_email || 'U').charAt(0).toUpperCase();
              const isUnread = item.status === 'unread';

              return (
                <div
                  key={item.id}
                  className={`admin-record-card feedback-card ${isUnread ? 'unread-card-highlight' : ''}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="record-card-head">
                    <div className="record-user-meta">
                      {/* Star Toggle Button */}
                      <button
                        type="button"
                        className={`item-star-btn ${item.is_starred ? 'starred' : ''}`}
                        onClick={(e) => handleToggleStar(item, e)}
                        title={item.is_starred ? 'Unstar feedback' : 'Star feedback'}
                      >
                        <StarIcon size={16} filled={item.is_starred} />
                      </button>

                      <div className="record-avatar-badge">
                        {item.user_photo ? (
                          <img src={item.user_photo} alt="" className="avatar-img-tiny" />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                      <div className="record-user-text">
                        <div className="user-name-title-row">
                          <strong>{item.user_name || 'Signed-in User'}</strong>
                          {isUnread && <span className="unread-pulse-badge">NEW</span>}
                        </div>
                        <span className="record-email-line">{item.user_email || 'Verified Account'}</span>
                      </div>
                    </div>

                    <div className="record-rating-badge">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          size={14}
                          filled={star <= Number(item.rating)}
                        />
                      ))}
                      <span className="rating-num-tag">{item.rating}/5</span>
                    </div>
                  </div>

                  {categoriesList.length > 0 && (
                    <div className="record-chips-row">
                      {categoriesList.map((cat) => (
                        <span key={cat} className="record-category-tag">
                          #{cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="record-message-text">{item.message}</p>

                  <div className="record-card-foot">
                    <div className="foot-meta-details">
                      <span className="record-date-tag">{dateStr}</span>
                      {item.contact_opt_in && (
                        <span className="opt-in-badge">
                          <CheckIcon size={11} /> Contact Consent Given
                        </span>
                      )}
                    </div>

                    <div className="contact-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-mark-read-toggle"
                        onClick={(e) => handleToggleRead(item, e)}
                        title={isUnread ? 'Mark as read' : 'Mark as unread'}
                      >
                        {isUnread ? 'Mark Read' : 'Mark Unread'}
                      </button>

                      <button
                        type="button"
                        className="btn-delete-record"
                        onClick={() => handleDeleteFeedback(item.id)}
                        disabled={deletingId === item.id}
                        title="Delete feedback entry"
                      >
                        {deletingId === item.id ? <SpinnerIcon size={14} /> : <TrashIcon size={14} />}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (sent) {
    return (
      <Success
        title="Thank you!"
        message="Your feedback helps shape what we build next for the SignSpeak platform."
        onReset={() => {
          setSent(false);
          setRating(0);
          setCategories([]);
          setMessage('');
          if (isAdmin) setAdminViewMode('feed');
        }}
      />
    );
  }

  const displayedRating = hoveredRating || rating;

  return (
    <form className="feedback-form" onSubmit={submit} noValidate>
      {isAdmin && (
        <div className="admin-toggle-bar">
          <span className="admin-status-note">
            <ShieldIcon size={14} /> You are signed in as an Administrator
          </span>
          <button
            type="button"
            className="btn btn-outline mini-btn"
            onClick={() => setAdminViewMode('feed')}
          >
            ← View Submissions ({adminFeedback.length})
          </button>
        </div>
      )}

      {/* User Verified Identity Banner */}
      <div className="feedback-user-identity">
        <div className="identity-avatar">{userName.charAt(0).toUpperCase()}</div>
        <div className="identity-details">
          <span className="identity-name">{userName}</span>
          <span className="identity-email">{userEmail}</span>
        </div>
        <span className="locked-pill"><LockIcon size={12} /> Account verified</span>
      </div>

      <div className="field">
        <label>Overall Experience</label>
        <div className="stars" role="radiogroup" aria-label="Rating out of 5 stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={`star ${value <= displayedRating ? 'active' : ''}`}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-checked={rating === value}
              role="radio"
            >
              <StarIcon size={24} filled={value <= displayedRating} />
            </button>
          ))}
          <span className="rating-label">{ratingLabels[displayedRating]}</span>
        </div>
      </div>

      <div className="field">
        <label>What are you giving feedback on? (Choose at least one)</label>
        <div className="chips chipwrap">
          {available.map((category) => {
            const isSelected = categories.includes(category);
            return (
              <button
                type="button"
                key={category}
                className={`chip ${isSelected ? 'selected on' : ''}`}
                onClick={() =>
                  setCategories((current) =>
                    current.includes(category)
                      ? current.filter((c) => c !== category)
                      : [...current, category]
                  )
                }
                aria-pressed={isSelected}
              >
                <span className="chip-indicator">{isSelected ? '✓' : '+'}</span>
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label htmlFor="fb-message">
          Your thoughts <span className="field-count">{message.length}/2000</span>
        </label>
        <textarea
          id="fb-message"
          placeholder="Tell us what worked, what failed, or what feature you need..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength="2000"
          rows={5}
        />
      </div>

      <div className="field-checkbox">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={contactOptIn}
            onChange={(e) => setContactOptIn(e.target.checked)}
          />
          <span>It's okay to follow up with me via my account email ({userEmail})</span>
        </label>
      </div>

      <button
        className="btn btn-primary form-submit-btn"
        type="submit"
        disabled={!rating || !categories.length || message.trim().length < 10 || submitting}
      >
        {submitting ? (
          <>
            <SpinnerIcon size={16} />
            <span>Submitting Feedback...</span>
          </>
        ) : (
          <span>Submit Feedback</span>
        )}
      </button>
    </form>
  );
}
