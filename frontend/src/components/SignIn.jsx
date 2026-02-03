import { useNavigate } from 'react-router-dom'

function SignInButton() {
    const navigate = useNavigate()

    function handleSignIn() {
        navigate("/signin")
    }

    return (
        <button className="button" onClick={handleSignIn}>Sign In</button>
    )
}

export default SignInButton