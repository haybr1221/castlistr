import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'
import Select from "react-select"
import CharPerfSelector from '../components/CharPerfSelector.jsx' 
import ShowDropdown from '../components/ShowDropdown.jsx'

function CreatePage() {
    const [step, setStep] = useState('selectShow')
    const [selectedShow, setSelectedShow] = useState()
    const [characters, setCharacters] = useState([])
    const [performers, setPerformers] = useState([])
    const [selections, setSelections] = useState({})
    const [listTitle, setListTitle] = useState('')
    const navigate = useNavigate()

    const { user } = useCurrentUser()

    useEffect(() => { 
        document.title = `Create a List - castlistr`; 
    
    }, [])

    // useEffect(() => {
    //     if (userLoading) return

    //     if (!user) {
    //         // send to signin or index
    //         navigate("/signin")
    //         return
    //         }

    //     if (!profile?.username) {
    //         // send to edit profile
    //         navigate("/edit-profile")
    //         }
    //     }, [userLoading, user, profile, navigate])

    // if (userLoading || !user || !profile?.username) {
    //     return null 
    // }

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
        // Create the cast list
        const { data, error } = await supabase
            .from("cast_lists")
            .insert({
                show_id: selectedShow.value,
                title: listTitle,
                user_id: user.id
            })
            .select()

        if (error) throw error;

        // Get the ID of the new list
        const castListId = data[0].id;

        // Create an array to add to the database
        const entries = Object.entries(selections).map(([charId, perfId]) => ({
            cast_list_id: castListId,
            character_id: charId,
            performer_id: perfId
        }))

        const { error: entryError } = await supabase
            .from("cast_list_entry")
            .insert(entries)

        if (entryError) throw entryError

        // Send the user to view this cast list
        navigate(`/cast-lists/${castListId}`) 
    }

    useEffect(() => {
        fetch('http://localhost:3000/performer')
        .then((response => response.json()))
        .then((data) => {
            setPerformers(data)
        })
    }, [])

    useEffect(() => {
        // In case the show is changed
        setSelections({})

        if (!selectedShow) {
            setCharacters([])
            setSelections({})
            return
        }

        fetch(`http://localhost:3000/show/${selectedShow?.value}/characters`)
        .then((response => response.json()))
        .then((data) => {
            setCharacters(data)
        })
    }, [selectedShow])
    
    return (
        <main id="create-main">
            <div id="create-container">
                <h1 id="create-title">Create a New Cast List</h1>

                { step === 'selectShow' && (
                    <div>
                        <h2 className="step">Step 1: Choose a Show</h2>
                        <ShowDropdown 
                            value={selectedShow}
                            onChange={setSelectedShow}
                        />
                        <button type="button" onClick={() => setStep("selectChar")} className="button">Next Step</button>
                    </div>
                )}

                { step === 'selectChar' && (
                    <div>
                        <h2 className="step">Step 2: Choose Your Performers</h2>
                        <CharPerfSelector 
                            characters={characters}
                            performers={performers}
                            selections={selections}
                            onSelectionChange={handleSelectionChange}
                        />
                        <div className="two-buttons">
                            <button type="button" onClick={() => setStep("selectShow")} className="button">Previous Step</button>
                            <button type="button" onClick={() => setStep("selectTitle")} className="button">Next Step</button>
                        </div>
                    </div>
                )}

                { step === 'selectTitle' && (
                    <div>
                        <h2 className="step">Step 3: Name Your List</h2>
                        <label htmlFor="list-name" className="label">List Name:</label>
                        <input 
                            name="list-name"
                            type="text"
                            value={listTitle}
                            onChange={e => setListTitle(e.target.value)}
                            required
                            placeholder="My Cast List"
                        />
                        <div className="two-buttons">
                            <button type="button" onClick={() => setStep("selectChar")} className="button">Previous Step</button>
                            <button type="button" onClick={handleSubmit} className="button">Create List</button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}

export default CreatePage