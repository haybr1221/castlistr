import { useCurrentUser } from "../config/currentUser.js"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import UploadAvatar from "../components/UploadAvatar"
import { supabase } from "../config/supabaseclient.js"

function EditProfilePage() {
    const { username } = useParams()
    const { user, isLoading } = useCurrentUser()
    const navigate = useNavigate()

    const [profileId, setProfileId] = useState("")
    const [newUsername, setNewUsername] = useState("")
    const [error, setError] = useState(null)
    const [saveAvatar, setSaveAvatar] = useState(false)

    // First fetch the ID for this user
    useEffect(() => {
        fetch(`http://localhost:3000/get-user/${username}`)
        .then((response => response.json()))
        .then((data) => {
            setProfileId(data.id)
        })
        .catch((err) => {
            console.error("Error fetching user: ", err)
            setError(err)
            navigate("/home")
        })
    }, [username, navigate])

    // Make sure this user is supposed to be here
    useEffect(() => {
        if (isLoading) return

        // In case the user is not logged in, send them to the index
        if (!user) {
            navigate("/index")
            return
        }

        // If both IDs don't match, send to the public profile
        if (profileId && user.id != profileId) {
            navigate(`/users/${username}`)
        }
    }, [isLoading, user, profileId, username, navigate])

    // Don't show anything unless it's done loading
    if (isLoading || !user || !profileId || user.id != profileId)
    {
        return null
    }

    // Handle uploading a new avatar
    function handleUpload() {
        setSaveAvatar(true)
    }

    // Handle username change
    async function handleUsernameChange() {
        console.log("username")
        console.log(newUsername)

        const { error: usernameError} = await supabase
            .from("profile")
            .update({
                username: newUsername
            })
            .eq("id", user.id)

        if (usernameError) throw usernameError

        console.log("Success!")
    }

    return (
        <main id="centering">
            <div id="edit-profile">
                <h1 id="edit-title">Edit Profile</h1>
                <p className="label">Change username:</p>
                <input 
                    type="text"
                    className="text-input"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={handleUsernameChange}>Update</button>
                <p className="label">
                    Change profile picture:
                </p>
                
                <UploadAvatar onUploaded={handleUpload}></UploadAvatar>
                { saveAvatar && (
                    <div>Updated!</div>
                )}
            </div>
        </main>
    )
}

export default EditProfilePage