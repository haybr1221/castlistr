import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'

function SignOutButton() {
    const navigate = useNavigate()

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error("Error signing out: ", error)
        }
        
        navigate("/")
    }

    return (
        <button className="button" onClick={handleSignOut}>Sign Out</button>
    )
}

export default SignOutButton