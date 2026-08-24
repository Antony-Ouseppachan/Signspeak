import { useState } from 'react';
import ChatbotIcon from './ChatbotIcon.jsx';
import { faq, quickQuestions } from '../data/content.js';

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: 'Hi! Ask me about setup, sign detection, or the learning site. I\'ll answer from our FAQ first.', who: 'bot' }]);
  const [input, setInput] = useState('');

  function answer(question) {
    if (!question.trim()) return;
    const key = Object.keys(quickQuestions).find((item) => quickQuestions[item] === question) || Object.keys(faq).find((item) => question.toLowerCase().includes(item));
    setMessages((current) => [...current, { text: question, who: 'user' }, { text: key ? faq[key] : "I don't have that in my FAQ yet. Try the Contact page and we'll follow up directly.", who: 'bot' }]);
  }

  function submit(event) {
    event.preventDefault();
    answer(input);
    setInput('');
  }

  return <>
    <button className="chat-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close chat assistant' : 'Open chat assistant'} aria-expanded={open}><ChatbotIcon /></button>
    {open && <div className="chat-panel" role="dialog" aria-label="SignSpeak chat">
      <div className="chat-head"><ChatbotIcon className="avatar" /><div><strong>Signa</strong><span>SignSpeak AI guide</span></div></div>
      <div className="chat-body">{messages.map((message, index) => <div className={`msg ${message.who}`} key={`${message.who}-${index}`}>{message.text}</div>)}</div>
      <div className="chat-quick">{Object.entries(quickQuestions).map(([key, question]) => <button key={key} onClick={() => answer(question)}>{question}</button>)}</div>
      <form className="chat-input" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a question..." aria-label="Chat question" /><button type="submit">Send</button></form>
    </div>}
  </>;
}
