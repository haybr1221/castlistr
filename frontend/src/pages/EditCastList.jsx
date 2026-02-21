import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseclient'
import CharPerfSelector from '../components/CharPerfSelector'

function EditCastListPage() {
    // Display a cast list on its own page
    const { id } = useParams()
    const [castList, setCastList] = useState(null)
    const [characters, setCharacters] = useState([])
    const [performers, setPerformers] = useState([])
    const [selections, setSelections] = useState({})
    const [showId, setShowId] = useState(null)
    const navigate = useNavigate()
    
    useEffect(() => {
        // Fetch the cast list
        fetch(`http://localhost:3000/get-list/${id}`)
        .then((response) => response.json())
        .then((data) => {
            setCastList(data)
            
            // Create a list to store the inital selections
            const initialSelections = {}
            for (const entry of data.cast_list_entry) {
                initialSelections[entry.character.id] = entry.performer.id
            }
            setSelections(initialSelections)
            setShowId(data.show_id)
        })
        .catch((err) => {
            console.error("Error fetching list: ", err)
        })

    }, [id])

    useEffect(() => {
        fetch('http://localhost:3000/performer')
        .then((response => response.json()))
        .then((data) => {
            setPerformers(data)
        })
    }, [])

    useEffect(() => {
        if (!showId) return

        fetch(`http://localhost:3000/show/${showId}/characters`)
        .then((response => response.json()))
        .then((data) => {
            setCharacters(data)
        })
    }, [showId])

    function handleSelectionChange(charId, perfId) {
        // Once a selection is detected, set it 
        setSelections((prev) => {
            const next = { ... prev}

            if (perfId == null) {
                // In the case of it being removed, remove it from the list too
                delete next[charId]
            }
            else {
                // Update it to show the connection
                next[charId] = perfId
            }

            return next
        })
    }

    async function handleSubmit() {
        // Clear the initial selections in case of any differences
        const { error: deleteError } = await supabase
            .from("cast_list_entry")
            .delete()
            .eq("cast_list_id", castList.id)

        if (deleteError) throw deleteError

        // Create an array of the selections to add to the database
        const entries = Object.entries(selections).map(([charId, perfId]) => ({
            cast_list_id: castList.id,
            character_id: charId,
            performer_id: perfId
        }))

        const { error: entryError } = await supabase
            .from("cast_list_entry")
            .insert(entries)

        if (entryError) throw entryError

        // return to non-editing page
        navigate(`/cast-lists/${castList.id}`)
    }

    if (!castList) {
        return <p>Loading cast list...</p>
    }

    if (!characters.length || !performers.length) {
        return <p>Loading characters and performers...</p>
    }

    return (
        <main id="centering">
            <div className="edit-cast-list-card">
                <div className="list-header">
                    <div className="profile-link">
                        <img
                            src={castList.profile.avatar_url}
                            alt={`Profile picture for ${castList.profile.username}`}
                            className="list-avatar"
                        />
                        <div className="title-div">
                            <p className="list-title">{castList.title}</p>
                            <p className="list-subtitle">
                                {`${castList.profile.username}'s cast for ${castList.show.title}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="edit-cast-list">
                    <CharPerfSelector
                        characters={characters}
                        performers={performers}
                        selections={selections}
                        onSelectionChange={handleSelectionChange}
                    />

                </div>
                <div className="cast-list-footer" id="save-changes">
                    <button type="button" onClick={handleSubmit} className="button">Save Changes</button>
                </div>
            </div>
        </main>
    )
}

export default EditCastListPage