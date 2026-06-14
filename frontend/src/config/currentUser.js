import { supabase } from './supabaseclient.js';
import { useState, useEffect } from 'react';

export function useCurrentUser() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

    useEffect(() => {
        let isCancelled = false

        async function loadUserAndProfile() {
            try {
                setIsLoading(true)
                setError(null)
                setNeedsProfileSetup(false)

                // Fetch user via supabase auth
                const { data, error: authError } = await supabase.auth.getUser()
                if (authError) throw authError

                const supaUser = data?.user || null
                if (!supaUser) {
                    if (!isCancelled) {
                        setUser(null)
                        setProfile(null)
                    }
                    return
                }

                if (!isCancelled) {
                    setUser(supaUser)
                }

                // Fetch profile info for this user
                const res = await fetch(`http://localhost:3000/get-profile/${supaUser.id}`)

                const profileData = await res.json()
                
                if (!isCancelled) {
                    // Profile doesn't exist or has no username
                    if (!profileData || !profileData.id || !profileData.username) {
                        setNeedsProfileSetup(true)
                        setProfile(profileData || null)
                    } else {
                        setProfile(profileData)
                    }
                }
            }
            catch (err) {
                if (!isCancelled) {
                    console.error("Error loading current user/profile: ", err)
                    setError(err)
                }
            }
            finally {
                if(!isCancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadUserAndProfile()

        return () => {
            isCancelled = true
        }
    }, [])

    return { user, profile, isLoading, error, needsProfileSetup }
}
