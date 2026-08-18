import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home.jsx'
import Internships from './pages/Internships.jsx'
import StudentLeaders from './pages/StudentLeaders.jsx'
import ResearchForm from './pages/ResearchForm.jsx'
import ThankYou from './pages/ThankYou.jsx'

/** Per-route <title>, matching the titles the static pages used. */
const TITLES = {
  '/': "Orevalo — Africa's AI Education & Career Platform",
  '/internships': 'Internships — Orevalo',
  '/student-leaders': 'Founding Student Leaders Program — Orevalo',
  '/research': 'Orevalo — Student Research Form',
  '/thank-you': "You're in! — Orevalo",
}

export default function App() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] ?? TITLES['/']
  }, [pathname])

  // Router keeps scroll position between routes; anchors within a page still work.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/internships" element={<Internships />} />
      <Route path="/student-leaders" element={<StudentLeaders />} />
      <Route path="/research" element={<ResearchForm />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
