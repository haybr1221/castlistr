import { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import DisplayCastList from '../components/DisplayCastList.jsx'
import { useCurrentUser } from '../config/currentUser.js'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [castLists, setCastLists] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const { user, profile, isLoading: userLoading, error: userError } = useCurrentUser()
    
    useEffect(() => {
        setIsLoading(true)
        setError(null)
        

        fetch('http://localhost:3000/cast-lists')
        .then((response => response.json()))
        .then((data) => {
            setCastLists(data)
            setIsLoading(false)
        })
        .catch((err) => {
            console.error("Error fetching cast lists: ", err)
            setError(err)
            setIsLoading(false)
        })
    }, [])

    return (
        <main id="home-page">
            <div className="feed">
                {error && (
                <p style={{ color: 'red'}}>
                    Error loading shows: {error.message || String(error)}
                </p>
                )}

                {!isLoading && !error && (
                <> {castLists.map((list) => (
                    <DisplayCastList key={list.id} castList={list} />
                    ))}
                </>
                )}
            </div>

            <div id="profile-container">
                <div id="user-info-container">
                    <div id="profile-pic">
                        {/* <img src="" alt="" className="avatar" id="user-avatar" /> */}
                    </div>
                    <div id="user-info">
                        {!userLoading && (
                            <p id="username">{profile.username}</p>
                        )}
                        <p id="user-list-count">0 Cast Lists</p>
                    </div>
                </div>
                <div className="user-options">
                <ul id="user-settings">
                    {profile && (
                        <Link to={`/users/${profile.username}`}>
                        <li>My Profile</li>
                        </Link>
                    )}
                    <Link to="/create">
                        <li>Create a New List</li>
                    </Link>
                    <a href="#">
                    <li>Settings</li>
                    </a>
                </ul>
                </div>
            </div>
        </main>
    )
}

export default HomePage