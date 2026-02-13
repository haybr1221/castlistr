import { useCurrentUser } from "../config/currentUser.js"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import UploadAvatar from "../components/UploadAvatar"
import { supabase } from "../config/supabaseclient.js"

function EditProfilePage() {
    const { user, profile, isLoading, needsProfileSetup } = useCurrentUser()
    const navigate = useNavigate()

    const [newUsername, setNewUsername] = useState("")
    const [error, setError] = useState(null)
    const [saveAvatar, setSaveAvatar] = useState(false)
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

    // Handle uploading a new avatar
    function handleUpload() {
        setSaveAvatar(true)
    }

    // Get Google avatar from user metadata (works for Google OAuth)
    // Google stores it in either avatar_url or picture
    const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
    console.log("User metadata:", user?.user_metadata)
console.log("Google avatar URL:", googleAvatar)

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
                // Also set avatar if it's missing and we have a Google avatar
                const updateData = { username: newUsername.trim() }
                
                if (!profile.avatar_url && googleAvatar) {
                    updateData.avatar_url = googleAvatar
                }

                const { error: updateError } = await supabase
                    .from("profile")
                    .update(updateData)
                    .eq("id", user.id)

                if (updateError) throw updateError
            } else {
                // Create new profile row
                const { error: insertError } = await supabase
                    .from("profile")
                    .insert({
                        id: user.id,
                        username: newUsername.trim(),
                        avatar_url: googleAvatar
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

    // Function to use Google avatar for existing profiles
    async function handleUseGoogleAvatar() {
        if (!googleAvatar) return
        
        setIsSubmitting(true)
        try {
            const { error: updateError } = await supabase
                .from("profile")
                .update({ avatar_url: googleAvatar })
                .eq("id", user.id)

            if (updateError) throw updateError
            
            setSaveAvatar(true) // Show success message
        } catch (err) {
            setError(err.message || "Failed to update avatar")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main id="centering">
            <div id="edit-profile">
                <h1 id="edit-title">{isFirstTimeSetup ? "Complete Your Profile" : "Edit Profile"}</h1>
                
                {isFirstTimeSetup && (
                    <p className="setup-message">Welcome! Please choose a username to get started.</p>
                )}

                {/* Show Google avatar preview during first-time setup */}
                {isFirstTimeSetup && googleAvatar && (
                    <div className="avatar-preview">
                        <p className="label">Your Google profile picture will be used:</p>
                        <img src={googleAvatar} 
                        alt="Google avatar" 
                        className="avatar" 
                        referrerPolicy="no-referrer"
                        style={{width: '80px', height: '80px', borderRadius: '50%'}} />
                        
                    </div>
                )}

                {error && <p style={{color: 'red'}}>{error}</p>}

                <p className="label">{isFirstTimeSetup ? "Choose a username:" : "Change username:"}</p>
                <input 
                    type="text"
                    className="text-input"
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

                {/* Only show avatar options after profile is created */}
                {!isFirstTimeSetup && (
                    <>
                        <p className="label">Change profile picture:</p>
                        
                        {/* Option to use Google avatar if available and not already set */}
                        {googleAvatar && !profile?.avatar_url && (
                            <div style={{marginBottom: '10px'}}>
                                <p style={{fontSize: '14px', marginBottom: '5px'}}>Use your Google avatar:</p>
                                <img src={googleAvatar} alt="Google avatar" style={{width: '60px', height: '60px', borderRadius: '50%', marginRight: '10px'}} />
                                <button onClick={handleUseGoogleAvatar} className="button" disabled={isSubmitting}>
                                    Use This
                                </button>
                            </div>
                        )}
                        
                        <UploadAvatar onUploaded={handleUpload}></UploadAvatar>
                        {saveAvatar && <div>Updated!</div>}
                    </>
                )}
            </div>
        </main>
    )
}

export default EditProfilePage
