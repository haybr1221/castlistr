import { Link } from 'react-router-dom'

function IndexPage() {
    return (
        <main className="center-content">
            <div id="main-container">
                <h1 id="title">castlistr</h1>
                <Link to="/signin"> <button className="button">Get Started</button></Link>
            </div>
        </main>
    )
}

export default IndexPage