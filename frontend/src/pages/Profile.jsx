import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
    // const [likedLists, setLikedLists] = useState([])
    // const [likedListsLoading, setLikedListsLoading] = useState(null)
    // const [likedListsError, setLikedListsError] = useState(null)
    const [currentTab, setCurrentTab] = useState("lists")

    const { user } = useCurrentUser()

    useEffect(() => {
        // First fetch the ID for this user

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
        if (!userId) return 

        setUserListsLoading(true)
        setUserListsError(null)

        // Fetch the cast lists for this user
        fetch(`http://localhost:3000/cast-lists/${userId}`)
        .then((response => response.json()))
        .then((data) => {
            setUserLists(data)
            setUserListsLoading(false)
        })
    }, [userId])

    console.log(userLists)

    if (user.id == profileId) {
        // This is the user's profile, set button to edit profile
        setProfileButton("editProfile")
    }
    // else if (user.id == )

    // TODO: fetch liked lists
    // useEffect(() => {
    //     setLikedListsLoading(true)
    //     setLikedListsError(null)
    // })

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
                    <button>button</button>
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
                    {userLists.map((list) => (
                        <DisplayCastLists key={list.id} castList={list} />
                    ))}
                    </div>
                )}
                { currentTab == 'liked' && (
                    <div className="profile-lists">liked lists</div>
                )}
            </div>
        </main>
    )
}

export default ProfilePage