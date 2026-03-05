import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'
import CharPerfSelector from '../components/CharPerfSelector.jsx' 
import ShowDropdown from '../components/ShowDropdown.jsx'
import PerformerCreditModal from '../components/PerformerCreditModal.jsx'

function CreatePage() {
    const [step, setStep] = useState('selectShow')
    const [selectedShow, setSelectedShow] = useState()
    const [characters, setCharacters] = useState([])
    const [performers, setPerformers] = useState([])
    const [selections, setSelections] = useState({})
    const [listTitle, setListTitle] = useState('')
    const [creditModalVisible, setCreditModalVisible] = useState(false)
    const [creditModalData, setCreditModalData] = useState(null)
    const [matches, setMatches] = useState({})
    const navigate = useNavigate()

    const { user } = useCurrentUser()

    useEffect(() => { 
        document.title = `Create a List - castlistr`; 
    }, [])

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

    async function handlePerformerCheck(perfId, charId) {
        if (!perfId) {
            // reset the matches state in case a performer is removed from the list
            setMatches(prev => {
                    const next = { ... prev};
                    delete next[charId]
                    return next
                })
            return
        }

        const credits = await fetchCredits(perfId, charId);

        if (credits.length > 0) {
            // data exists for this pairing
            setMatches(prev => ({... prev, [charId]: credits}))
        }
        else {
            // clear!
            setMatches(prev => {
                const next = { ... prev};
                delete next[charId]
                return next
            })
        }
    }

    const openCreditModal = (charId) => {
        const credits = matches[charId]
        if (credits) {
            setCreditModalData({ credits })
            setCreditModalVisible(true)
        }
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

    async function fetchCredits(perfId, charId) {
        const { data, error } = await supabase
            .from("performer_has_character")
            .select(`
                *,
                character ( name ),
                performer ( full_name ),
                tour:tour_id (
                    *
                )`)
            .eq("performer_id", perfId)
            .eq("char_id", charId)
            .order("arrived", {ascending : true})
            
        if (error) throw error;

        return data
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
                    <div className="current-step">
                        <h2 className="step">Step 1: Choose a Show</h2>
                        <ShowDropdown 
                            value={selectedShow}
                            onChange={setSelectedShow}
                        />
                        <button type="button" onClick={() => setStep("selectChar")} className="button">Next Step</button>
                    </div>
                )}

                { step === 'selectChar' && (
                    <div className="current-step">
                        <h2 className="step">Step 2: Choose Your Performers</h2>
                        <CharPerfSelector 
                            characters={characters}
                            performers={performers}
                            selections={selections}
                            matches={matches}
                            onShowCredits={openCreditModal}
                            onSelectionChange={handleSelectionChange}
                            onPerformerSelected={handlePerformerCheck}
                            showId={selectedShow.value}
                            setCharacters={setCharacters}
                            setPerformers={setPerformers}
                        />
                        <div className="two-buttons">
                            <button type="button" onClick={() => setStep("selectShow")} className="button">Previous Step</button>
                            <button type="button" onClick={() => setStep("selectTitle")} className="button">Next Step</button>
                        </div>
                    </div>
                )}

                {creditModalVisible && (
                    <>
                        <div id="overlay"></div>
                        <PerformerCreditModal 
                            data={creditModalData}
                            onClose={() => setCreditModalVisible(false)}
                            />
                    </>
                )}

                { step === 'selectTitle' && (
                    <div className="current-step">
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