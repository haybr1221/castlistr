import { useCurrentUser } from '../config/currentUser.js'
import { Link } from 'react-router-dom'

function IndexPage() {
    const { user } = useCurrentUser()

    function handleGetStarted() {
        if (user) {
            // no need to sign in, take right to home
            window.location.href = '/home'
        }

        else {
            // take to sign in page
            window.location.href = '/signin'
        }
    }
    return (
        <main className="center-content">
            <div id="main-container">
                <h1 id="title">castlistr</h1>
                <p className="text" id="tagline">Fancasting, made simple.</p>
                <button className="button" onClick={handleGetStarted}>Get Started</button>
            </div>
        </main>
    )
}

export default IndexPage