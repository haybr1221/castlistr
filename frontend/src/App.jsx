import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import SignOutButton from './components/SignOut.jsx'
// import pages
import IndexPage from './pages/Index.jsx'
import SignInPage from './pages/SignIn.jsx'
import HomePage from './pages/Home.jsx'
import ShowsPage from './pages/Shows.jsx'
import ShowPage from './pages/Show.jsx'
import PerformersPage from './pages/Performers.jsx'
import CreatePage from './pages/Create.jsx'
import ProfilePage from './pages/Profile.jsx'
import EditProfilePage from './pages/EditProfile.jsx'
import CastListPage from './pages/CastList.jsx'

function App() {
  return (
    <div>
      <header>
        <Link to="/home" className="link"><h1 id="header-title">castlistr</h1></Link>
        <nav id="navbar">
          <Link to="/home" className="nav-bar">Home</Link>
          <Link to="/shows" className="nav-bar">Shows</Link>
          <Link to="/performers" className="nav-bar">Performers</Link>
          <Link to="/create" className="nav-bar">Create</Link>
          <SignOutButton />
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/shows" element={<ShowsPage />} />
        <Route path="/shows/:slug" element={<ShowPage />} />
        <Route path="/performers" element={<PerformersPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/users/:username" element={<ProfilePage />} />
        <Route path="/users/:username/edit-profile" element={<EditProfilePage />} />
        <Route path="/cast-lists/:id" element={<CastListPage />} />
      </Routes>
    </div>
  )
}

export default App
