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

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    
    const navigate = useNavigate()
    
    const { user } = useCurrentUser()

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
            page: String(page),
        })
        if (searchTerm) {
            params.set("search", searchTerm)
        }

        fetch(`http://localhost:3000/show-pagination?${params.toString()}`)
            .then((response) => response.json())
            .then((result) => {
                setShows(result.data)
                setTotalPages(result.totalPages)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching shows: ", err)
                setError(err)
                setIsLoading(false)
            })
    }, [page, searchTerm])

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
                        <input 
                            type="text" 
                            placeholder="Search for a show..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(1)
                                setSearchTerm(e.target.value)}
                            }
                        />
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

                        <div className="pagination">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >Previous</button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >Next</button>
                        </div>
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