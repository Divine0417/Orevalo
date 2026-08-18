import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  CalendarClock,
  ChevronDown,
  MapPin,
  Search,
} from '../components/icons/Icons.jsx'
import { FIELDS, LOCATIONS, daysUntil, formatDeadline, listings } from '../data/listings.js'
import './Internships.css'

const ALL = 'All'

/**
 * Internship listings.
 *
 * The listings come from a local module today; when the API lands, swap the
 * import for a fetch into state and nothing below has to change.
 */
export default function Internships() {
  const [field, setField] = useState(ALL)
  const [location, setLocation] = useState(ALL)

  const visible = useMemo(
    () =>
      listings.filter(
        (l) => (field === ALL || l.field === field) && (location === ALL || l.location === location),
      ),
    [field, location],
  )

  const filtered = field !== ALL || location !== ALL

  return (
    <div className="page-internships">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-name">
              Ore<span>valo</span>
            </span>
            <span className="tagline">Study smart. Build your future.</span>
          </Link>
          <Link to="/" className="back-link">
            <ArrowLeft /> Back to home
          </Link>
        </div>
      </header>

      <section className="intro">
        <div className="eyebrow">
          <Briefcase /> Internships
        </div>
        <h1>
          Internships open to <em>African students</em>, in one place.
        </h1>
        <p>
          Hand-picked roles from companies hiring students and recent graduates right now. Check the
          deadline, then apply directly — no account needed.
        </p>
      </section>

      <div className="filter-bar">
        <div className="filter-inner">
          <Dropdown label="Field" value={field} onChange={setField} options={FIELDS} />
          <Dropdown label="Location" value={location} onChange={setLocation} options={LOCATIONS} />
          <button
            type="button"
            className="reset-btn"
            disabled={!filtered}
            onClick={() => {
              setField(ALL)
              setLocation(ALL)
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <main className="results">
        <p className="result-count">
          Showing <strong>{visible.length}</strong>{' '}
          {visible.length === 1 ? 'opportunity' : 'opportunities'}
          {filtered ? ' matching your filters' : ''}
        </p>

        {visible.length > 0 ? (
          <div className="listing-grid">
            {visible.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="empty-icon">
              <Search />
            </span>
            <h3>No internships match those filters</h3>
            <p>Try a different field or location — we add new roles every week.</p>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>
          <a href="https://orevalo.com" target="_blank" rel="noreferrer">
            orevalo.com
          </a>
          <a href="mailto:hello@orevalo.com">hello@orevalo.com</a>
        </p>
        <p className="copyright">© 2026 Orevalo. Built with purpose for African students.</p>
      </footer>
    </div>
  )
}

function Dropdown({ label, value, onChange, options }) {
  const id = `filter-${label.toLowerCase()}`

  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value={ALL}>All {label.toLowerCase()}s</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="chevron">
          <ChevronDown />
        </span>
      </div>
    </div>
  )
}

function ListingCard({ listing }) {
  const remaining = daysUntil(listing.deadline)
  const closingSoon = remaining >= 0 && remaining <= 14

  return (
    <article className="listing-card">
      <div className="card-top">
        <span className="company">
          <Building /> {listing.company}
        </span>
        <span className="field-tag">{listing.field}</span>
      </div>

      <h2>{listing.title}</h2>

      <div className="meta">
        <span className="meta-row">
          <span className="meta-icon">
            <MapPin />
          </span>
          {listing.location}
        </span>
        <span className="meta-row">
          <span className="meta-icon">
            <CalendarClock />
          </span>
          Deadline: {formatDeadline(listing.deadline)}
          {closingSoon && <span className="closing-soon">Closing soon</span>}
        </span>
      </div>

      <a className="apply-btn" href={listing.applyUrl} target="_blank" rel="noreferrer">
        Apply Now <ArrowRight />
      </a>
    </article>
  )
}
