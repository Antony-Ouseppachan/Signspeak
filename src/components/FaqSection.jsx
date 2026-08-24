import { useState } from 'react';
import { faqList } from '../data/content.js';
import { SearchIcon, CloseIcon } from './Icons.jsx';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = faqList.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-container">
      <div className="faq-search-box">
        <span className="faq-search-icon">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          className="faq-search-input"
          placeholder="Search technical FAQ, latency, privacy, model specifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="faq-clear-search" onClick={() => setSearch('')} aria-label="Clear search">
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      <div className="faq-list">
        {filtered.length > 0 ? (
          filtered.map((item, index) => {
            const isOpen = openIdx === index;
            return (
              <div key={item.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenIdx(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="faq-empty">
            <p>No questions matched your search query. Try another keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}
