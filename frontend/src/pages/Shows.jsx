import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'
import DisplayShows from '../components/DisplayShows.jsx'
import AddShowModal from '../components/AddShowModal.jsx'

function ShowsPage() {
    // To set shows
    const [shows, setShows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const navigate = useNavigate()
    
    const { user } = useCurrentUser()

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        fetch('http://localhost:3000/show')
        .then(response => response.json())
        .then((data) => {
            setShows(data)
            setIsLoading(false)
        })
        .catch((error) => {
            console.error("Error fetching shows: ", error)
            setError(error)
            setIsLoading(false)
        })
    }, [])

    // TODO: add abilitiy to add poster when creating

    async function handleCreate(title, isMultiple) {

        const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        const { data, error } = await supabase
            .from("show")
            .insert([
                {
                    title: title,
                    user_id: user.id,
                    slug: slug
                }])
            .select()
        
        if (error) throw error

        setShows(prev => [...prev, data[0]])

        if (!isMultiple) {
            setModalVisible(false)
            navigate(`${slug}`)
            return
        }

    }

    return (
        <main>
            <div id="show-page">
                <h1 id="title">Shows</h1>
                <div id="show-wrap">
                    <div id="show-search">
                        <input type="text" placeholder="Search for a show..." />
                        <button onClick={() => setModalVisible(true)}>Add New Show</button>
                    </div>
                    <div id="shows">
                        {isLoading && <p>Loading shows..</p>}
                        {error && (
                            <p style={{ color: 'red'}}>
                            Error loading shows: {error.message || String(error)}
                            </p>
                        )}
                        {!isLoading && !error && <DisplayShows shows={shows}/>}
                    </div>
                        
                    {modalVisible && (
                        <>
                            <div id="overlay"></div>
                            <AddShowModal onClose={() => setModalVisible(false)} onCreate={handleCreate} />
                        </>
                    )}

                </div>
            </div>
        </main>
    )
}

export default ShowsPage