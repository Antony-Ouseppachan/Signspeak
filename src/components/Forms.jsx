import { useState } from 'react';

function downloadJSON(filename, object) {
  const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function store(key, entry) {
  const values = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([...values, entry]));
}

function Success({ title, message }) { return <div className="successbox show"><div className="check">✓</div><h3>{title}</h3><p>{message}</p><p className="saved-note">Saved as a .json file to your downloads.</p></div>; }

const contactRules = {
  name: (value) => value.trim().length < 2 ? 'Please enter at least 2 characters.' : '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Enter a valid email address.',
  subject: (value) => value ? '' : 'Please choose a subject.',
  message: (value) => value.trim().length < 10 ? 'Message should be at least 10 characters.' : value.trim().length > 2000 ? 'Message must be 2000 characters or fewer.' : '',
};

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function validateField(field, value) {
    return contactRules[field](value);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (touched[name]) setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  }

  function markTouched(event) {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(Object.keys(contactRules).map((field) => [field, validateField(field, values[field])]));
    setTouched({ name: true, email: true, subject: true, message: true });
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const payload = { ...values, timestamp: new Date().toISOString() };
    store('signspeak_contacts', payload); downloadJSON(`signspeak-contact-${Date.now()}.json`, payload); setSent(true);
  }

  if (sent) return <Success title="Message sent" message="We'll get back to you soon." />;
  const fieldProps = (field) => ({ name: field, value: values[field], onChange: updateField, onBlur: markTouched, 'aria-invalid': Boolean(touched[field] && errors[field]), 'aria-describedby': `${field}-feedback` });
  return <form onSubmit={submit} noValidate>
    <div className={`field ${touched.name && errors.name ? 'invalid' : ''} ${touched.name && !errors.name ? 'valid' : ''}`}><label htmlFor="c-name">Name</label><input id="c-name" type="text" placeholder="Your full name" autoComplete="name" {...fieldProps('name')} /><div className="err" id="name-feedback" role="alert">{errors.name}</div></div>
    <div className={`field ${touched.email && errors.email ? 'invalid' : ''} ${touched.email && !errors.email ? 'valid' : ''}`}><label htmlFor="c-email">Email</label><input id="c-email" type="email" placeholder="you@example.com" autoComplete="email" {...fieldProps('email')} /><div className="err" id="email-feedback" role="alert">{errors.email}</div></div>
    <div className={`field ${touched.subject && errors.subject ? 'invalid' : ''} ${touched.subject && !errors.subject ? 'valid' : ''}`}><label htmlFor="c-subject">Subject</label><select id="c-subject" {...fieldProps('subject')}><option value="">Select a topic</option><option>General question</option><option>Bug report</option><option>Extension not detecting signs</option><option>Learning platform</option><option>Partnership / press</option></select><div className="err" id="subject-feedback" role="alert">{errors.subject}</div></div>
    <div className={`field ${touched.message && errors.message ? 'invalid' : ''} ${touched.message && !errors.message ? 'valid' : ''}`}><label htmlFor="c-message">Message <span className="field-count">{values.message.length}/2000</span></label><textarea id="c-message" placeholder="Tell us what's going on..." maxLength="2000" {...fieldProps('message')} /><div className="err" id="message-feedback" role="alert">{errors.message}</div></div>
    <button className="btn btn-primary" type="submit">Send message</button>
  </form>;
}

export function FeedbackForm() {
  const [rating, setRating] = useState(0); const [hoveredRating, setHoveredRating] = useState(0); const [categories, setCategories] = useState([]); const [message, setMessage] = useState(''); const [contactOptIn, setContactOptIn] = useState(false); const [sent, setSent] = useState(false);
  const available = ['Bug','Feature Request','Design','Speech Accuracy','Detection Accuracy','Praise'];
  const ratingLabels = ['Select a rating', 'Needs attention', 'Could be better', 'Getting there', 'Working well', 'Excellent experience'];
  function submit(event) { event.preventDefault(); if (!rating || !categories.length || message.trim().length < 10) return; const payload = { rating, categories, message: message.trim(), contactOptIn, timestamp: new Date().toISOString() }; store('signspeak_feedback', payload); downloadJSON(`signspeak-feedback-${Date.now()}.json`, payload); setSent(true); }
  if (sent) return <Success title="Thank you!" message="Your feedback helps shape what we build next." />;
  const displayedRating = hoveredRating || rating;
  return <form className="feedback-form" onSubmit={submit} noValidate><div className="feedback-intro"><span className="feedback-index">FEEDBACK LOOP / 02</span><span className="feedback-live"><i /> LOCAL CHANNEL OPEN</span></div><div className="field rating-field"><label id="rating-label">How is SignSpeak working for you?</label><div className="stars" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHoveredRating(0)}>{[1,2,3,4,5].map((value) => <button type="button" role="radio" aria-checked={rating === value} aria-label={`${value} out of 5 stars`} className={value <= displayedRating ? 'on' : ''} onMouseEnter={() => setHoveredRating(value)} onFocus={() => setHoveredRating(value)} onBlur={() => setHoveredRating(0)} onClick={() => setRating(value)} key={value}>★</button>)}</div><span className={`rating-caption ${displayedRating ? 'active' : ''}`}>{ratingLabels[displayedRating]}</span></div><div className="field"><label>What should we focus on?</label><div className="chipwrap">{available.map((category) => <button type="button" aria-pressed={categories.includes(category)} className={`chip ${categories.includes(category) ? 'on' : ''}`} onClick={() => setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} key={category}>{category}<span>{categories.includes(category) ? '✓' : '+'}</span></button>)}</div></div><div className="field"><label htmlFor="fb-text">Tell us what happened <span className="field-count">{message.length}/1000</span></label><textarea id="fb-text" name="message" value={message} maxLength="1000" onChange={(event) => setMessage(event.target.value)} placeholder="Share details, steps to reproduce, or ideas..." /></div><label className="checkline"><input type="checkbox" name="contactOptIn" checked={contactOptIn} onChange={(event) => setContactOptIn(event.target.checked)} /> Okay to contact me about this feedback</label><button className="btn btn-primary" type="submit" disabled={!rating || !categories.length || message.trim().length < 10}>Submit feedback <span className="submit-arrow">↗</span></button></form>;
}
