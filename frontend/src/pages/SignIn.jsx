import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'

function SignInPage() {
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [step, setStep] = useState('email')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleSendOtp(e) {
        e.preventDefault()
        setError(null)

        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error)
        {
            setError(error.message)
            return
        }

        setStep('otp')
    }

    async function handleVerifyOtp(e) {
        e.preventDefault()
        setError(null)

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email"
        });

        if (error) {
            setError(error.message)
            return
        } 
        else {
            console.log("User logged in:", data.user);
            navigate("/home");
        }
    }

    async function handleGoogleSignIn() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/home'
            }
        })

        if (error) setError(error.message)
    }

    return (
        <main id="centering">
            <div id="main-container">
                <h1 id="title">castlistr</h1>

                { step === 'email' && (
                    <>
                        <button type="button" onClick={handleGoogleSignIn} className="google-btn">
                            <div className="google-icon-wrapper">
                                <img
                                className="google-icon"
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google logo"
                                />
                            </div>
                                <p className="btn-text">Sign in with Google</p>
                        </button>
                        <div id="or-divider"><span>or</span></div>
                        <form onSubmit={handleSendOtp} className="display-container">
                            <input id="email" type="email" placeholder="Email for a one-time passcode" value={email} onChange={e => setEmail(e.target.value)}/>
                            <button type="submit" className="button">Send Code</button>
                        </form>
                    </>
                )}

                { step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="display-container">
                        <input id="code" type="text" placeholder="Enter code" value={token} onChange={e => setToken(e.target.value)}/>
                        <button type="submit" className="button">Verify</button>
                    </form>
                )}

                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>
        </main>
    )
}

export default SignInPage