import { useCurrentUser } from "../config/currentUser.js"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "../config/supabaseclient.js"

function EditProfilePage() {
    const { user, profile, isLoading, needsProfileSetup } = useCurrentUser()
    const navigate = useNavigate()

    const [newUsername, setNewUsername] = useState("")
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Determine if this is first-time setup
    const isFirstTimeSetup = needsProfileSetup

    useEffect(() => {
        document.title = isFirstTimeSetup ? `Complete Your Profile - castlistr` : `Edit Profile - castlistr`;
    }, [isFirstTimeSetup])

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
    if (isLoading || !user) {
        return null
    }

    // Handle profile save (works for both first-time and updates)
    async function handleSaveProfile() {
        if (!newUsername.trim()) {
            setError("Username is required")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Check if profile row exists in the database
            const profileExists = profile && profile.id

            if (profileExists) {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from("profile")
                    .update({ username: newUsername.trim() })
                    .eq("id", user.id)

                if (updateError) throw updateError
            } else {
                // Create new profile row
                const { error: insertError } = await supabase
                    .from("profile")
                    .insert({
                        id: user.id,
                        username: newUsername.trim()
                    })

                if (insertError) throw insertError
            }

            navigate(`/users/${newUsername.trim()}`)
        } catch (err) {
            console.error("Error saving profile:", err)
            setError(err.message || "Failed to save profile")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="center-content">
            <div id="edit-profile">
                <h1 id="edit-title">{isFirstTimeSetup ? "Complete Your Profile" : "Edit Profile"}</h1>

                {isFirstTimeSetup && (
                    <p className="text">Welcome! Please choose a username to get started.</p>
                )}

                {error && <p style={{color: 'red'}}>{error}</p>}

                <p className="label">{isFirstTimeSetup ? "Choose a username:" : "Change username:"}</p>
                <input
                    type="text"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <button
                    onClick={handleSaveProfile}
                    className="button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : (isFirstTimeSetup ? "Create Profile" : "Update")}
                </button>
            </div>
        </main>
    )
}

export default EditProfilePage
