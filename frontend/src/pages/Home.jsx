import { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import DisplayCastList from '../components/DisplayCastList.jsx'
import { useCurrentUser } from '../config/currentUser.js'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [castLists, setCastLists] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userListCount, setUserListCount] = useState(null)

    const { user, profile, isLoading: userLoading } = useCurrentUser()
    const navigate = useNavigate();

    console.log(profile)

    const isLoggedIn = !!user
    const hasUsername = !!profile?.username
    const isProfileComplete = isLoggedIn && hasUsername
    
    // useEffect(() => {
    //     if (!isProfileComplete) navigate("/users/edit-profile")
    // }, [isProfileComplete])


    useEffect(() => { 
        document.title = `castlistr`; 
    }, [])
    
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

    useEffect(() => {
        if (!profile) return 

        // Fetch the cast lists for this user
        fetch(`http://localhost:3000/cast-lists/${profile.id}`)
        .then((response => response.json()))
        .then((data) => {
            // Add the count
            setUserListCount(data.length)
        })

    }, [profile])

    return (
        <main id="home-page">
            <div className="feed">
                {error && (
                <p style={{ color: 'red'}}>
                    Error loading shows: {error.message || String(error)}
                </p>
                )}

                {!isLoading && !error && (
                <> {castLists && castLists.map((list) => (
                    <DisplayCastList key={list.id} castList={list} />
                    ))}
                </>
                )}
            </div>

            {isLoggedIn && (
                <div id="profile-container">
                    <div id="user-info-container">
                        <div id="profile-pic">
                            {!userLoading &&  profile?.avatar_url &&(                            
                                <img 
                                    src={profile.avatar_url} 
                                    alt={`Profile picture for ${profile.username}`}
                                    className="avatar"
                                />
                            )}
                        </div>
                        <div id="user-info">
                            {!userLoading && profile?.username && (
                                <p id="username">{profile.username}</p>
                            )}
                            <p id="user-list-count">{userListCount} {userListCount === 1 ? "Cast List" : "Cast Lists"}</p>
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
                        <Link to="/users/edit-profile">
                            <li>Settings</li>
                        </Link>
                    </ul>
                    </div>
                </div>
            )}
        </main>
    )
}

export default HomePage