import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DisplayCastList from '../components/DisplayCastList'
import CharPerfSelector from '../components/CharPerfSelector'
import { supabase } from '../config/supabaseclient'

function EditCastListPage() {
    // Display a cast list on its own page
    const { id } = useParams()
    const [castList, setCastList] = useState(null)
    const [listTitle, setListTitle] = useState("")
    const [characters, setCharacters] = useState([])
    const [performers, setPerformers] = useState([])
    const [selections, setSelections] = useState({})
    const [showId, setShowId] = useState(null)
    const [step, setStep] = useState(null)
    const [castListError, setCastListError] = useState(null)

    useEffect(() => {
        // Fetch the cast list
        fetch(`http://localhost:3000/get-list/${id}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            setCastList(data)
            setListTitle(data.title)
            
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
            setCastListError(err)
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
        console.log("Deleting entries for cast_list_id:", castList.id)
        const { data: beforeRows } = await supabase
            .from("cast_list_entry")
            .select("id, character_id, performer_id")
            .eq("cast_list_id", castList.id)
        console.log("Before delete:", beforeRows)

        // Clear the initial selections in case of any differences
        const { error: deleteError } = await supabase
            .from("cast_list_entry")
            .delete()
            .eq("cast_list_id", castList.id)

        if (deleteError) throw deleteError

        const { data: afterRows } = await supabase
        .from("cast_list_entry")
        .select("id, character_id, performer_id")
        .eq("cast_list_id", castList.id)
        console.log("After delete:", afterRows)

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
    }

    if (!castList) {
        return <p>Loading cast list...</p>
    }

    if (!characters.length || !performers.length) {
        return <p>Loading characters and performers...</p>
    }

    return (
        <>
        <main id="centering">
            <CharPerfSelector
                characters={characters}
                performers={performers}
                selections={selections}
                onSelectionChange={handleSelectionChange}
                />
        </main>

        <button type="button" onClick={handleSubmit}>Save Changes</button>
        </>
    )
}

export default EditCastListPage