import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  ShieldIcon,
  StarIcon,
  SpinnerIcon,
  TrashIcon,
  RefreshIcon,
  AlertTriangleIcon,
  SearchIcon,
  CheckIcon,
  LockIcon,
  ContactIcon,
  MailIcon,
  CloseIcon
} from './Icons.jsx';
import { AuthRequiredGate, EmailReplyModal } from './Forms.jsx';

export default function AdminDashboard({ onOpenAuth, navigate }) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'contacts'
  const [feedbackList, setFeedbackList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null); // id of item being deleted
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'STARRED'
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [replyingContact, setReplyingContact] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  function showToast(msg, type = 'success') {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }

  async function fetchAdminData() {
    setLoading(true);
    setForbidden(false);
    setErrorMsg('');

    try {
      const [feedbackData, contactsData] = await Promise.all([
        api.getAdminFeedback(),
        api.getAdminContacts()
      ]);
      setFeedbackList(Array.isArray(feedbackData) ? feedbackData : []);
      setContactsList(Array.isArray(contactsData) ? contactsData : []);
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      if (err.status === 403 || err.message?.includes('403') || err.message?.includes('Access Denied')) {
        setForbidden(true);
      } else if (err.status === 401) {
        setErrorMsg('Your session has expired. Please sign in again.');
      } else {
        setErrorMsg(err.message || 'Failed to load administrator data from Neon database.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFeedback(id) {
    if (!window.confirm('Are you sure you want to permanently delete this feedback entry?')) return;
    setActionInProgress(id);
    try {
      await api.deleteAdminFeedback(id);
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
      showToast('Feedback entry deleted successfully.');
    } catch (err) {
      console.error('[AdminDashboard] Delete feedback error:', err);
      alert('Failed to delete feedback: ' + (err.message || 'Unknown error'));
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleDeleteContact(id) {
    if (!window.confirm('Are you sure you want to permanently delete this contact submission?')) return;
    setActionInProgress(id);
    try {
      await api.deleteAdminContact(id);
      setContactsList((prev) => prev.filter((item) => item.id !== id));
      showToast('Contact submission deleted successfully.');
    } catch (err) {
      console.error('[AdminDashboard] Delete contact error:', err);
      alert('Failed to delete contact submission: ' + (err.message || 'Unknown error'));
    } finally {
      setActionInProgress(null);
    }
  }

  // Star & Read Toggles for Feedback
  async function handleToggleFeedbackStar(item, e) {
    if (e) e.stopPropagation();
    const nextStarred = !item.is_starred;
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, is_starred: nextStarred } : f))
    );
    try {
      await api.updateAdminFeedback(item.id, { is_starred: nextStarred });
    } catch (err) {
      console.warn('Failed to star feedback:', err);
    }
  }

  async function handleToggleFeedbackRead(item, e) {
    if (e) e.stopPropagation();
    const nextStatus = item.status === 'unread' ? 'read' : 'unread';
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus } : f))
    );
    try {
      await api.updateAdminFeedback(item.id, { status: nextStatus });
    } catch (err) {
      console.warn('Failed to update feedback status:', err);
    }
  }

  // Star & Read Toggles for Contacts
  async function handleToggleContactStar(item, e) {
    if (e) e.stopPropagation();
    const nextStarred = !item.is_starred;
    setContactsList((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_starred: nextStarred } : c))
    );
    try {
      await api.updateAdminContact(item.id, { is_starred: nextStarred });
    } catch (err) {
      console.warn('Failed to star contact:', err);
    }
  }

  async function handleToggleContactRead(item, e) {
    if (e) e.stopPropagation();
    const nextStatus = item.status === 'unread' ? 'read' : 'unread';
    setContactsList((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, status: nextStatus } : c))
    );
    try {
      await api.updateAdminContact(item.id, { status: nextStatus });
    } catch (err) {
      console.warn('Failed to update contact status:', err);
    }
  }

  // Filtered Feedback
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.user_email && item.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.user_name && item.user_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNREAD' && item.status === 'unread') ||
        (statusFilter === 'STARRED' && item.is_starred);

      const matchesRating =
        ratingFilter === 'ALL' || Number(item.rating) === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [feedbackList, searchQuery, statusFilter, ratingFilter]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contactsList.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNREAD' && item.status === 'unread') ||
        (statusFilter === 'STARRED' && item.is_starred);

      return matchesSearch && matchesStatus;
    });
  }, [contactsList, searchQuery, statusFilter]);

  // Quick Metrics
  const avgRating = useMemo(() => {
    if (!feedbackList.length) return '0.0';
    const sum = feedbackList.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    return (sum / feedbackList.length).toFixed(1);
  }, [feedbackList]);

  const feedbackUnreadCount = useMemo(() => feedbackList.filter((f) => f.status === 'unread').length, [feedbackList]);
  const feedbackStarredCount = useMemo(() => feedbackList.filter((f) => f.is_starred).length, [feedbackList]);

  const contactsUnreadCount = useMemo(() => contactsList.filter((c) => c.status === 'unread').length, [contactsList]);
  const contactsStarredCount = useMemo(() => contactsList.filter((c) => c.is_starred).length, [contactsList]);

  if (!user) {
    return (
      <section className="view active admin-view-wrap">
        <div className="admin-container">
          <AuthRequiredGate
            onOpenAuth={onOpenAuth}
            title="Administrator Sign In Required"
            desc="Please sign in with a verified administrator account (listed in ADMIN_EMAILS) to access the SignSpeak management console."
          />
        </div>
      </section>
    );
  }

  if (forbidden) {
    return (
      <section className="view active admin-view-wrap">
        <div className="admin-container">
          <div className="admin-forbidden-card">
            <div className="forbidden-icon-badge">
              <AlertTriangleIcon size={32} />
            </div>
            <h2>Access Denied: Administrator Only</h2>
            <p className="forbidden-lead">
              You are currently signed in as <strong>{user.email}</strong>, which is not registered in the system administrator whitelist (<code className="mono">ADMIN_EMAILS</code>).
            </p>
            <div className="forbidden-help-box">
              <span>To gain administrative access, please ask a project maintainer to add your email address to the Cloudflare Worker <code className="mono">ADMIN_EMAILS</code> environment variable.</span>
            </div>
            <div className="forbidden-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => (navigate ? navigate('about') : window.location.hash = '#about')}
              >
                Return to Platform
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchAdminData}
              >
                <RefreshIcon size={15} />
                <span>Retry Verification</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="view active admin-view-wrap">
      <div className="admin-container">
        {/* Notification Toast */}
        {notification && (
          <div className={`admin-toast-banner ${notification.type}`}>
            <CheckIcon size={16} />
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Console Header */}
        <div className="admin-console-header">
          <div>
            <h1 className="admin-page-title">SignSpeak Admin Console</h1>
            <p className="admin-page-sub">
              Live feedback telemetry, community sentiment, and inbound contact submissions.
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-outline refresh-data-btn"
              onClick={fetchAdminData}
              disabled={loading}
              title="Refresh live data from Neon"
            >
              <RefreshIcon size={16} className={loading ? 'spin-icon' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="admin-stats-ribbon">
          <div className="admin-stat-card">
            <span className="stat-card-label">TOTAL FEEDBACK</span>
            <div className="stat-card-val-row">
              <strong className="stat-val">{feedbackList.length}</strong>
              <span className="stat-badge">Community</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="stat-card-label">AVERAGE RATING</span>
            <div className="stat-card-val-row">
              <strong className="stat-val rating-highlight">{avgRating} ★</strong>
              <span className="stat-badge">Sentiment</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="stat-card-label">INQUIRIES</span>
            <div className="stat-card-val-row">
              <strong className="stat-val">{contactsList.length}</strong>
              <span className="stat-badge">Contact Us</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="stat-card-label">DATABASE SYNC</span>
            <div className="stat-card-val-row">
              <strong className="stat-val sync-live">ONLINE</strong>
              <span className="stat-badge">Neon Pooler</span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="admin-error-banner">
            <AlertTriangleIcon size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Tabs Navigation */}
        <div className="admin-tab-bar">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('feedback');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          >
            <span>Community Feedback</span>
            <span className="tab-counter-badge">{feedbackList.length}</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('contacts');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          >
            <span>Contact Submissions</span>
            <span className="tab-counter-badge">{contactsList.length}</span>
          </button>
        </div>

        {/* Search & Top Filter Pills (All / Unread / Starred) */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrap">
            <SearchIcon size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder={
                activeTab === 'feedback'
                  ? 'Search feedback text, email, or user name...'
                  : 'Search by sender, email, subject, or message...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <div className="rating-filter-pills status-filter-pills">
            <button
              type="button"
              className={`rating-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({activeTab === 'feedback' ? feedbackList.length : contactsList.length})
            </button>
            <button
              type="button"
              className={`rating-pill unread-pill ${statusFilter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNREAD')}
            >
              <span className="pill-dot unread" /> Unread ({activeTab === 'feedback' ? feedbackUnreadCount : contactsUnreadCount})
            </button>
            <button
              type="button"
              className={`rating-pill starred-pill ${statusFilter === 'STARRED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('STARRED')}
            >
              <StarIcon size={13} filled={statusFilter === 'STARRED'} /> Starred ({activeTab === 'feedback' ? feedbackStarredCount : contactsStarredCount})
            </button>
          </div>
        </div>

        {activeTab === 'feedback' && (
          <div className="feedback-sub-filters" style={{ marginBottom: '20px' }}>
            <span className="sub-filter-label">Filter by rating:</span>
            <div className="rating-filter-pills">
              {['ALL', '5', '4', '3', '2', '1'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`rating-pill mini-pill ${ratingFilter === r ? 'active' : ''}`}
                  onClick={() => setRatingFilter(r)}
                >
                  {r === 'ALL' ? 'All ★' : `${r} ★`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="admin-loading-state">
            <SpinnerIcon size={32} />
            <p>Querying Neon Lakebase Postgres...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: COMMUNITY FEEDBACK */}
            {activeTab === 'feedback' && (
              <div className="admin-feed-container">
                {filteredFeedback.length === 0 ? (
                  <div className="admin-empty-state">
                    <StarIcon size={36} />
                    <h3>No feedback records found</h3>
                    <p>
                      {searchQuery || statusFilter !== 'ALL' || ratingFilter !== 'ALL'
                        ? 'Try adjusting your filters or search keywords.'
                        : 'Feedback submitted by community members will appear here in real time.'}
                    </p>
                  </div>
                ) : (
                  <div className="admin-cards-grid">
                    {filteredFeedback.map((item) => {
                      const categories = Array.isArray(item.categories)
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

                      const userInitial = (item.user_name || item.user_email || 'U')
                        .charAt(0)
                        .toUpperCase();

                      const isUnread = item.status === 'unread';

                      return (
                        <div
                          key={item.id}
                          className={`admin-record-card feedback-card ${isUnread ? 'unread-card-highlight' : ''}`}
                          onClick={() => {
                            if (isUnread) handleToggleFeedbackRead(item);
                          }}
                        >
                          <div className="record-card-head">
                            <div className="record-user-meta">
                              {/* Star Button */}
                              <button
                                type="button"
                                className={`item-star-btn ${item.is_starred ? 'starred' : ''}`}
                                onClick={(e) => handleToggleFeedbackStar(item, e)}
                                title={item.is_starred ? 'Unstar feedback' : 'Star feedback'}
                              >
                                <StarIcon size={16} filled={item.is_starred} />
                              </button>

                              <div className="record-avatar-badge">
                                {item.user_photo ? (
                                  <img src={item.user_photo} alt="" className="avatar-img-tiny" />
                                ) : (
                                  <span>{userInitial}</span>
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

                          {/* Categories Tag Row */}
                          {categories.length > 0 && (
                            <div className="record-chips-row">
                              {categories.map((cat) => (
                                <span key={cat} className="record-category-tag">
                                  #{cat}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Message Body */}
                          <p className="record-message-text">{item.message}</p>

                          {/* Card Footer */}
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
                                onClick={(e) => handleToggleFeedbackRead(item, e)}
                                title={isUnread ? 'Mark as read' : 'Mark as unread'}
                              >
                                {isUnread ? 'Mark Read' : 'Mark Unread'}
                              </button>

                              <button
                                type="button"
                                className="btn-delete-record"
                                onClick={() => handleDeleteFeedback(item.id)}
                                disabled={actionInProgress === item.id}
                                title="Delete feedback entry"
                              >
                                {actionInProgress === item.id ? (
                                  <SpinnerIcon size={14} />
                                ) : (
                                  <TrashIcon size={14} />
                                )}
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
            )}

            {/* TAB 2: CONTACT SUBMISSIONS */}
            {activeTab === 'contacts' && (
              <div className="admin-feed-container">
                {filteredContacts.length === 0 ? (
                  <div className="admin-empty-state">
                    <ContactIcon size={36} />
                    <h3>No contact submissions found</h3>
                    <p>
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'No inquiries match your active filters.'
                        : 'Inquiries submitted through the Contact Us form will appear here.'}
                    </p>
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

                      const userInitial = (item.name || item.email || 'C')
                        .charAt(0)
                        .toUpperCase();

                      const isUnread = item.status === 'unread';

                      return (
                        <div
                          key={item.id}
                          className={`admin-record-card contact-card ${isUnread ? 'unread-card-highlight' : ''}`}
                          onClick={() => {
                            if (isUnread) handleToggleContactRead(item);
                          }}
                        >
                          <div className="record-card-head">
                            <div className="record-user-meta">
                              {/* Star Button */}
                              <button
                                type="button"
                                className={`item-star-btn ${item.is_starred ? 'starred' : ''}`}
                                onClick={(e) => handleToggleContactStar(item, e)}
                                title={item.is_starred ? 'Unstar inquiry' : 'Star inquiry'}
                              >
                                <StarIcon size={16} filled={item.is_starred} />
                              </button>

                              <div className="record-avatar-badge contact-badge">
                                <span>{userInitial}</span>
                              </div>
                              <div className="record-user-text">
                                <div className="user-name-title-row">
                                  <strong>{item.name}</strong>
                                  {isUnread && <span className="unread-pulse-badge">NEW</span>}
                                </div>
                                <a
                                  href={`mailto:${item.email}`}
                                  className="record-email-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.email}
                                </a>
                              </div>
                            </div>

                            <div className="record-subject-pill">
                              <span>{item.subject}</span>
                            </div>
                          </div>

                          {/* Message Body */}
                          <div className="contact-message-box">
                            <p className="record-message-text">{item.message}</p>
                          </div>

                          {/* Card Footer */}
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
                                onClick={(e) => handleToggleContactRead(item, e)}
                                title={isUnread ? 'Mark as read' : 'Mark as unread'}
                              >
                                {isUnread ? 'Mark Read' : 'Mark Unread'}
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline mini-reply-btn"
                                onClick={() => {
                                  if (isUnread) handleToggleContactRead(item);
                                  setReplyingContact(item);
                                }}
                                title="Compose email reply"
                              >
                                <MailIcon size={13} />
                                <span>Reply via Email</span>
                              </button>

                              <button
                                type="button"
                                className="btn-delete-record"
                                onClick={() => handleDeleteContact(item.id)}
                                disabled={actionInProgress === item.id}
                                title="Delete submission"
                              >
                                {actionInProgress === item.id ? (
                                  <SpinnerIcon size={14} />
                                ) : (
                                  <TrashIcon size={14} />
                                )}
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
            )}
          </>
        )}

        {/* Email Reply Composer Modal */}
        {replyingContact && (
          <EmailReplyModal
            contact={replyingContact}
            onClose={() => setReplyingContact(null)}
            onStatusUpdated={(id, nextStatus) => {
              setContactsList((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
              );
              showToast('Contact submission marked as Replied.');
            }}
          />
        )}
      </div>
    </section>
  );
}
