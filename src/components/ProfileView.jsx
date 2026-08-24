import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  UserIcon,
  CheckIcon,
  SpinnerIcon,
  ShieldIcon,
  LogOutIcon,
  EditIcon
} from './Icons.jsx';

export default function ProfileView({ navigate }) {
  const { user, profile, updateUserProfile, signOutUser } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('ASL Signer / Participant');
  const [preferredDialect, setPreferredDialect] = useState('ASL (American Sign Language)');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.display_name || user?.displayName) {
      setDisplayName(profile?.display_name || user?.displayName || '');
    }
  }, [profile, user]);

  if (!user) {
    return (
      <section className="view active profile-view-section">
        <div className="profile-auth-prompt-card">
          <div className="prompt-icon-wrap">
            <UserIcon size={32} />
          </div>
          <h2>Sign In Required</h2>
          <p>Please sign in to access your profile settings, preferences, and account details.</p>
          <button className="btn btn-primary" onClick={() => navigate('about')}>
            Return to Home
          </button>
        </div>
      </section>
    );
  }

  const email = profile?.email || user?.email || 'No email associated';
  const photoURL = profile?.photo_url || user?.photoURL;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Member';

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMsg('Please enter a name with at least 2 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim()
      });
      setSuccessMsg('Your profile changes have been saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <section className="view active profile-view-section">
      <div className="profile-container">
        {/* Navigation Breadcrumb */}
        <div className="profile-nav-back">
          <button type="button" className="back-link-btn" onClick={() => navigate('about')}>
            ← Back to Home
          </button>
        </div>

        {/* Page Title */}
        <div className="profile-page-header">
          <div className="kicker">ACCOUNT SETTINGS</div>
          <h1>My Profile</h1>
          <p className="sub">
            Customize your display name, personal accessibility preferences, and sign-to-speech options.
          </p>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="profile-alert success-alert" role="status">
            <CheckIcon size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="profile-alert error-alert" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="profile-layout-grid">
          {/* Left Column: User Summary & Logout */}
          <div className="profile-sidebar-col">
            <div className="profile-hero-card">
              <div className="profile-avatar-wrapper">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="profile-avatar-img-main" />
                ) : (
                  <div className="profile-avatar-initial-main">{initial}</div>
                )}
                <span className="avatar-verified-badge" title="Active Account">
                  <CheckIcon size={12} />
                </span>
              </div>

              <h2 className="profile-hero-name">{displayName || 'SignSpeak User'}</h2>
              <span className="profile-hero-email">{email}</span>

              <div className="profile-hero-divider" />

              <div className="profile-quick-stats">
                <div className="quick-stat-row">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">{memberSince}</span>
                </div>
                <div className="quick-stat-row">
                  <span className="stat-label">Account Status</span>
                  <span className="stat-value status-active">
                    <span className="live-dot" /> Active
                  </span>
                </div>
              </div>

              <div className="profile-hero-actions">
                <button
                  type="button"
                  className="btn btn-outline signout-full-btn"
                  onClick={async () => {
                    await signOutUser();
                    navigate('about');
                  }}
                  title="Sign out of SignSpeak"
                >
                  <LogOutIcon size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Privacy Box */}
            <div className="profile-privacy-box">
              <div className="privacy-box-head">
                <ShieldIcon size={18} />
                <strong>Privacy Guaranteed</strong>
              </div>
              <p>
                SignSpeak processes all camera input directly on your device. Video frames are never recorded or stored.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Profile & Accessibility Preferences */}
          <div className="profile-main-col">
            {/* Edit Personal Info */}
            <div className="profile-settings-card">
              <div className="card-header-row">
                <div className="card-header-icon">
                  <EditIcon size={20} />
                </div>
                <div>
                  <h3>Profile Information</h3>
                  <p>Update how your name appears during live meetings and transcripts.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} noValidate className="profile-edit-form-full">
                <div className="field">
                  <label htmlFor="pf-name">
                    Full Name <span className="field-count">{displayName.length}/60</span>
                  </label>
                  <input
                    id="pf-name"
                    type="text"
                    value={displayName}
                    maxLength="60"
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="pf-email">Email Address</label>
                  <input
                    id="pf-email"
                    type="email"
                    value={email}
                    disabled
                    className="disabled-field"
                  />
                  <span className="field-subnote">Primary email linked to your account</span>
                </div>

                <div className="form-row-dual">
                  <div className="field">
                    <label htmlFor="pf-role">Your Role</label>
                    <select
                      id="pf-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option>Deaf / Hard-of-Hearing Meeting Signer</option>
                      <option>ASL Student / Learner</option>
                      <option>Meeting Participant / Colleague</option>
                      <option>Accessibility Educator</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="pf-dialect">Primary Sign Language</label>
                    <select
                      id="pf-dialect"
                      value={preferredDialect}
                      onChange={(e) => setPreferredDialect(e.target.value)}
                    >
                      <option>ASL (American Sign Language)</option>
                      <option>BSL (British Sign Language)</option>
                      <option>SEE (Signed Exact English)</option>
                      <option>ISL (International Sign)</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form-footer">
                  <button
                    type="submit"
                    className="btn btn-primary profile-save-btn"
                    disabled={submitting || displayName.trim().length < 2}
                  >
                    {submitting ? (
                      <>
                        <SpinnerIcon size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
