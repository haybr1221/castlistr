import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../config/currentUser.js'

function RequireProfile({ children }) {
    const { user, isLoading, needsProfileSetup } = useCurrentUser()

    if (isLoading) {
        return null // Or a loading spinner
    }

    // Not logged in - redirect to sign in
    if (!user) {
        return <Navigate to="/signin" replace />
    }

    // Logged in but needs profile setup - redirect to edit profile
    if (needsProfileSetup) {
        return <Navigate to="/users/edit-profile" replace />
    }

    return children
}

export default RequireProfile
