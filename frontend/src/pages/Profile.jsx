import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from "react-router-dom"
import { useCurrentUser } from '../config/currentUser'
import DisplayCastLists from '../components/DisplayCastList.jsx'

function ProfilePage() {
    const { username } = useParams()

    const [profileId, setProfileId] = useState('')
    const [userIdError, setUserIdError] = useState(null)
    const [userLists, setUserLists] = useState([])
    const [userListsLoading, setUserListsLoading] = useState(null)
    const [userListsError, setUserListsError] = useState(null)
    const [profileButton, setProfileButton] = useState(null)
    const [likedLists, setLikedLists] = useState([])
    const [likedListsLoading, setLikedListsLoading] = useState(null)
    const [likedListsError, setLikedListsError] = useState(null)
    const [currentTab, setCurrentTab] = useState("lists")

    const { user } = useCurrentUser()

    // First fetch the ID for this user
    useEffect(() => {
        fetch(`http://localhost:3000/get-user/${username}`)
        .then((response => response.json()))
        .then((data) => {
            setProfileId(data.id)
        })
        .catch((err) => {
            console.error("Error fetching user: ", err)
            setUserIdError(err)
        })
    }, [])

    useEffect(() => {
        if (!profileId) return 

        setUserListsLoading(true)
        setUserListsError(null)

        // Fetch the cast lists for this user
        fetch(`http://localhost:3000/cast-lists/${profileId}`)
        .then((response => response.json()))
        .then((data) => {
            setUserLists(data)
            setUserListsLoading(false)
        })
    }, [profileId])

    useEffect(() => {
        if (!profileId) return 

        setLikedListsLoading(true)
        setLikedListsError(null)

        // Fetch the liked casts lists for this user
        fetch(`http://localhost:3000/liked-lists/${profileId}`)
        .then((response => response.json()))
        .then((data) => {
            console.log("Liked lists response:", data)
            setLikedLists(data)
            setLikedListsLoading(false)
        })
        .catch((err) => {
            console.error("Error fetching liked lists:", err)
            setLikedListsError(err)
            setLikedListsLoading(false)
        })

        
    }, [profileId])

    const isOwnProfile = user && user.id == profileId

    // else if (user.id == )

    return (
        <main id="user-profile">
            <div id="user-information">
                <div id="profile-pic">
                    <img className="avatar" />
                </div>
                <div id="basic-info">
                    <p id="username">{username}</p>
                    <p id="user-list-count">0 Cast Lists</p>
                </div>
                <div id="button-div">
                    {isOwnProfile ? (
                        <Link to={`/users/${username}/edit-profile`}><button className="button">Edit Profile</button></Link>) : 
                        (<button>Follow</button> )}
                </div>
            </div>
            <div id="user-sections">
                <div id="tabs">
                    <p
                        id="lists"
                        className={currentTab === "lists" ? "tab active-tab" : "tab"}
                        onClick={() => setCurrentTab("lists")}>
                        Lists
                    </p>

                    <p
                        id="liked"
                        className={currentTab === "liked" ? "tab active-tab" : "tab"}
                        onClick={() => setCurrentTab("liked")}>
                        Liked
                    </p>
                </div>
                { currentTab == 'lists' && !userListsLoading && (
                    <div className="profile-lists">
                    {userLists.length === 0 && !userListsError && (
                    <p>No lists yet.</p>
                        )}
                    {userLists.map((list) => (
                        <DisplayCastLists key={list.id} castList={list} />
                    ))}
                    </div>
                )}
                { currentTab == 'liked' && !likedListsLoading && (
                    <div className="profile-lists">
                        {likedLists.length === 0 && !likedListsError && (
                            <p>No liked lists yet.</p>
                        )}
                        {likedLists.map((list) => (
                        <DisplayCastLists key={list.id} castList={list} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

export default ProfilePage