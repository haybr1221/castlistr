import { useCurrentUser } from "../config/currentUser.js"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import UploadAvatar from "../components/UploadAvatar"
import { supabase } from "../config/supabaseclient.js"

function EditProfilePage() {
    const { user, profile, isLoading } = useCurrentUser()
    const navigate = useNavigate()

    const [newUsername, setNewUsername] = useState("")
    const [error, setError] = useState(null)
    const [saveAvatar, setSaveAvatar] = useState(false)

    useEffect(() => { 
        document.title = `Edit Profile - castlistr`; 
    }, [])

    // Set everything
    useEffect(() => {
        if (isLoading) return

        // In case the user is not logged in, send them to do that
        if (!user) {
            navigate("/signin")
            return
        }

    }, [isLoading, user, navigate])

    // Don't show anything unless it's done loading
    if (isLoading || !user || !profile.id || user.id != profile.id)
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

        navigate(`/users/${newUsername}`)
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
                <button onClick={handleUsernameChange} className="button">Update</button>
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