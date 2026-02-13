import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from "react-router-dom"
import { useCurrentUser } from '../config/currentUser'
import DisplayCastLists from '../components/DisplayCastList.jsx'
import { supabase } from '../config/supabaseclient.js'

function ProfilePage() {
    const { username } = useParams()

    const [profileId, setProfileId] = useState('')
    const [userIdError, setUserIdError] = useState(null)
    const [userLists, setUserLists] = useState([])
    const [userListsLoading, setUserListsLoading] = useState(null)
    const [userListsError, setUserListsError] = useState(null)
    const [isFollowing, setIsFollowing] = useState(null)
    const [likedLists, setLikedLists] = useState([])
    const [likedListsLoading, setLikedListsLoading] = useState(null)
    const [likedListsError, setLikedListsError] = useState(null)
    const [currentTab, setCurrentTab] = useState("lists")
    const [avatarUrl, setAvatarUrl] = useState(null)

    const { user, profile } = useCurrentUser()

    useEffect(() => { 
        document.title = `${username}'s Profile - castlistr`; 
    }, [])

    // First fetch the ID for this user
    useEffect(() => {
        fetch(`http://localhost:3000/get-user/${username}`)
        .then((response => response.json()))
        .then((data) => {
            setProfileId(data.id)
            setAvatarUrl(data.avatar_url)
        })
        .catch((err) => {
            console.error("Error fetching user: ", err)
            setUserIdError(err)
        })
    }, [])


    // Fetch the user's cast lists
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

    // Fetch the user's liked lists
    useEffect(() => {
        if (!profileId) return 

        setLikedListsLoading(true)
        setLikedListsError(null)

        // Fetch the liked casts lists for this user
        fetch(`http://localhost:3000/liked-lists/${profileId}`)
        .then((response => response.json()))
        .then((data) => {
            setLikedLists(data)
            setLikedListsLoading(false)
        })
        .catch((err) => {
            console.error("Error fetching liked lists:", err)
            setLikedListsError(err)
            setLikedListsLoading(false)
        })
        
    }, [profileId])

    useEffect(() => {
        if (!user) return

        let isCancelled = false
        console.log(user.id)
        console.log(profileId)

        async function loadFollowed() {
            const response = await fetch(`http://localhost:3000/is-following/${user.id}/${profileId}`)
            const isFollowing = await response.json()
            console.log(isFollowing)
            if (!isCancelled) setIsFollowing(isFollowing)
        }

        loadFollowed()

        return () => { isCancelled = true }

    }, [user, profileId])

    async function toggleFollow() {
        if (!isFollowing)
        {
            // User is not following yet, so add it to the table
            const { error } = await supabase
                .from("follow")
                .insert({
                    following: profileId,
                    follower: user.id
                })

            if (error) throw error

            // We know they are now following this user
            setIsFollowing(true)
        }
        else {
            // User is following, so delete it to the table
            
            const { error } = await supabase
                .from("following")
                .delete()
                .eq("following_id", profileId)
                .eq("follower_id", user.id)

            if (error) throw error

            // We know they are no longer following this user
            setIsFollowing(false)
        }


    }

    const isOwnProfile = user && user.id == profileId

    return (
        <main id="user-profile">
            <div id="user-information">
                <div id="profile-pic">
                    <img src={avatarUrl} className="avatar"
                    referrerPolicy="no-referrer" />
                </div>
                <div id="basic-info">
                    <p id="username">{username}</p>
                    <p id="user-list-count">{userLists.length} {userLists.length === 1 ? "Cast List" : "Cast Lists"}</p>
                </div>
                <div id="button-div">
                    {isOwnProfile && (
                        <Link to={`/users/edit-profile`}><button className="button">Edit Profile</button></Link>
                    )}
                    {!isOwnProfile && !isFollowing && (
                        <button onClick={toggleFollow} className="button">Follow</button>
                    )}
                    {!isOwnProfile && isFollowing  && (
                        <button onClick={toggleFollow} className="button">Unfollow</button>
                    )}
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