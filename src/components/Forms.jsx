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

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    const nextErrors = { name: values.name.trim().length <= 1, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()), subject: !values.subject, message: values.message.trim().length < 10 };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const payload = { ...values, timestamp: new Date().toISOString() };
    store('signspeak_contacts', payload); downloadJSON(`signspeak-contact-${Date.now()}.json`, payload); setSent(true);
  }
  if (sent) return <Success title="Message sent" message="We'll get back to you soon." />;
  return <form onSubmit={submit} noValidate>{[['name','Name','Your full name'],['email','Email','you@example.com']].map(([id,label,placeholder]) => <div className={`field ${errors[id] ? 'invalid' : ''}`} key={id}><label htmlFor={`c-${id}`}>{label}</label><input id={`c-${id}`} name={id} type={id === 'email' ? 'email' : 'text'} placeholder={placeholder} /><div className="err">{id === 'email' ? 'Enter a valid email address.' : 'Please enter your name.'}</div></div>)}
    <div className={`field ${errors.subject ? 'invalid' : ''}`}><label htmlFor="c-subject">Subject</label><select id="c-subject" name="subject"><option value="">Select a topic</option><option>General question</option><option>Bug report</option><option>Extension not detecting signs</option><option>Learning platform</option><option>Partnership / press</option></select><div className="err">Please choose a subject.</div></div>
    <div className={`field ${errors.message ? 'invalid' : ''}`}><label htmlFor="c-message">Message</label><textarea id="c-message" name="message" placeholder="Tell us what's going on..." /><div className="err">Message should be at least 10 characters.</div></div><button className="btn btn-primary" type="submit">Send message</button></form>;
}

export function FeedbackForm() {
  const [rating, setRating] = useState(0); const [categories, setCategories] = useState([]); const [sent, setSent] = useState(false);
  const available = ['Bug','Feature Request','Design','Speech Accuracy','Detection Accuracy','Praise'];
  function submit(event) { event.preventDefault(); const payload = { rating, categories, message: new FormData(event.currentTarget).get('message').trim(), contactOptIn: event.currentTarget.contactOptIn.checked, timestamp: new Date().toISOString() }; store('signspeak_feedback', payload); downloadJSON(`signspeak-feedback-${Date.now()}.json`, payload); setSent(true); }
  if (sent) return <Success title="Thank you!" message="Your feedback helps shape what we build next." />;
  return <form onSubmit={submit}><div className="field"><label>Overall rating</label><div className="stars">{[1,2,3,4,5].map((value) => <button type="button" className={value <= rating ? 'on' : ''} onClick={() => setRating(value)} key={value}>★</button>)}</div></div><div className="field"><label>Category</label><div className="chipwrap">{available.map((category) => <button type="button" className={`chip ${categories.includes(category) ? 'on' : ''}`} onClick={() => setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} key={category}>{category}</button>)}</div></div><div className="field"><label htmlFor="fb-text">What can we improve?</label><textarea id="fb-text" name="message" placeholder="Share details, steps to reproduce, or ideas..." /></div><label className="checkline"><input type="checkbox" name="contactOptIn" /> Okay to contact me about this feedback</label><button className="btn btn-primary" type="submit">Submit feedback</button></form>;
}
