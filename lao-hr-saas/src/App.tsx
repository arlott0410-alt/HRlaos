import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-teal-800">Lao HR SaaS</h1>
      <p className="max-w-md text-slate-600">
        Stack: Vite, React 19, TypeScript, Tailwind, React Router v6, Supabase client, i18next,
        react-hook-form, zod, TanStack Query, Zustand, Recharts, react-hot-toast, Lucide.
      </p>
      <Link className="text-teal-600 underline underline-offset-2 hover:text-teal-700" to="/about">
        About
      </Link>
    </div>
  )
}

function About() {
  return (
    <div className="p-8">
      <Link to="/" className="text-teal-600 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-xl font-semibold">About</h1>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  )
}
