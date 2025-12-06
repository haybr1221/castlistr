import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'
import DisplayPerformers from '../components/DisplayPerformers.jsx'
import AddPerformerModal from '../components/AddPerformerModal.jsx'
import { useCurrentUser } from '../config/currentUser.js'

function PerformersPage() {
    const [performers, setPerformers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)

    const { user } = useCurrentUser()

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        fetch('http://localhost:3000/performer')
        .then(response => response.json())
        .then((data) => {
            setPerformers(data)
            setIsLoading(false)
        })
        .catch((error) => {
            console.error("Error fetching performers: ", error)
            setError(error)
            setIsLoading(false)
        })
    }, [])

    async function handleCreate(name, isMultiple) {

        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        const nameSplit = name.trim().split(/\s+/)
        const firstName = nameSplit[0]
        const lastName = nameSplit[nameSplit.length - 1]
        const middleName = nameSplit.slice(1, -1).join(" ")

        const { data, error } = await supabase
            .from("performer")
            .insert([{
                full_name: name,
                first_name: firstName,
                last_name: lastName,
                middle_name: middleName,
                slug: slug,
                user_id: user.id
            }])
            .select()

        if (error) throw error

        setPerformers(prev => [...prev, data[0]])

        if (!isMultiple) {
            setModalVisible(false)
            // TODO: navigate(`${slug}`)
            return
        }
    }

    return (
        <main id="centering">
            <div id="performer-page">
                <h1 id="title">Performers</h1>
                <button onClick={() => setModalVisible(true)}>Add New Performer</button>
                <ul className="text" id="performer-list">
                    {isLoading && <p>Loading performers...</p>}
                    {error && (
                        <p style={{ color: 'red'}}>
                        Error loading shows: {error.message || String(error)}
                        </p>
                    )}
                    {!isLoading && !error && <DisplayPerformers performers={performers}/>}
                </ul>

                {modalVisible && (
                    <>
                        <div id="overlay"></div>
                        <AddPerformerModal onClose={() => setModalVisible(false)} onCreate={handleCreate}/>
                    </>
                )}
            </div>
        </main>
    )
}

export default PerformersPage