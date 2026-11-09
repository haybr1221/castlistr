import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config/api'
import { Link } from "react-router-dom"
import { useCurrentUser } from '../config/currentUser'
import { supabase } from '../config/supabaseclient.js'
import ListCard from '../components/ListCard.jsx'

function ProfilePage() {
    const { username } = useParams()

    const [profileId, setProfileId] = useState('')
    const [userLists, setUserLists] = useState([])
    const [userListsLoading, setUserListsLoading] = useState(null)
    const [userListsError, setUserListsError] = useState(null)

    const { user } = useCurrentUser()

    useEffect(() => { 
        document.title = `${username}'s Profile - castlistr`; 
    }, [])

    // First fetch the ID for this user
    useEffect(() => {
        fetch(`${API_URL}/get-user/${username}`)
        .then((response => response.json()))
        .then((data) => {
            setProfileId(data.id)
        })
        .catch((err) => {
            console.error("Error fetching user: ", err)
        })
    }, [])


    // Fetch the user's cast lists
    useEffect(() => {
        if (!profileId) return 

        setUserListsLoading(true)
        setUserListsError(null)

        // Fetch the cast lists for this user
        fetch(`${API_URL}/cast-lists/${profileId}`)
        .then((response => response.json()))
        .then((data) => {
            setUserLists(data)
            setUserListsLoading(false)
        })
    }, [profileId])

    const isOwnProfile = user && user.id == profileId

    return (
        <main className="center-content" id="user-profile">
            <div id="user-information">
                <div id="basic-info">
                    <p id="username">{username}</p>
                    <p id="user-list-count">{userLists.length} {userLists.length === 1 ? "Cast List" : "Cast Lists"}</p>
                </div>
                <div>
                    {isOwnProfile && (
                        <Link to={`/users/edit-profile`}><button className="button">Edit Profile</button></Link>
                    )}
                </div>
            </div>
            <div id="user-sections">
                { !userListsLoading && (
                    <div className="profile-lists">
                        {userLists.length === 0 && !userListsError && (
                            <p>No lists yet.</p>
                        )}
                        {userLists.map((list) => (
                            <ListCard key={list.id} castList={list} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

export default ProfilePage