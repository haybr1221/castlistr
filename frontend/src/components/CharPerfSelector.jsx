/* Handle assigning a character to a performer */

import { useState } from 'react'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'
import Select from "react-select"
import AddCharacterModal from "./AddCharacterModal"
import AddPerformerModal from "./AddPerformerModal.jsx"

function CharPerfSelector({ 
    characters = [], 
    performers = [], 
    selections = [], 
    onSelectionChange = [], 
    showId = 0, 
    setCharacters = () => {},
    setPerformers = () => {}}) 
{
    const [charModalVisible, setCharModalVisible] = useState(false)
    const [perfModalVisible, setPerfModalVisible] = useState(false)

    const { user } = useCurrentUser()

    // Create the list of performers to use
    const performerList = performers.map((performer) => ({
        value: performer.id,
        label: performer.full_name
    }))

    async function handleCreateChar(name, isMultiple) {

        // Check if this character exists already
        const { data: existingData, error: existingError } = await supabase 
            .from("show_has_character")
            .select(`id,
                character:char_id!inner ( id, name) `)
            .eq("show_id", showId)
            .eq("character.name", name)
            .limit(1)

        if (existingError) throw existingError

        if (existingData && existingData.length > 0 )
        {
            return { ok: false, error: `"${name}" is already in this show.` }
        }

        // Insert into characters
        const { data, error } = await supabase
            .from("character")
            .insert({
                name: name,
                user_id: user.id
            })
            .select()

        if (error) throw error
        
        const newCharId = data[0].id
        
        // Insert into show_has_character
        const { error: showCharError } = await supabase
            .from("show_has_character")
            .insert({
                show_id: showId,
                char_id: newCharId,
                user_id: user.id
            })

        if (showCharError) throw showCharError

        // create the format CharPerfSelector expects to see
        const newChar = {
            ...data[0],
            show_has_character: [
                { show_id: showId, char_id: newCharId}
            ]
        }

        console.log("Supabase returned:", data[0]);
        setCharacters([...characters, newChar]);

        if (!isMultiple) {
            // If it isn't multiple, return
            setCharModalVisible(false)
            return
        }

        return { ok: true };
    }

    async function handleCreatePerf(name, isMultiple) {

        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

        const nameSplit = name.trim().split(/\s+/)
        const firstName = nameSplit[0]
        const lastName = nameSplit[nameSplit.length - 1]
        const middleName = nameSplit.slice(1, -1).join(" ")

        // Check if this performer exists
        const { data: existingData, error: existingError } = await supabase
            .from("performer")
            .select("full_name")
            .eq("full_name", name)
            .limit(1)

        if (existingError) throw existingError

        if (existingData && existingData.length > 0)
        {
            return { ok: false, error: `"${name}" is already in the database.` }
        }

        // Insert

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
            setPerfModalVisible(false)
            return
        }

        return { ok: true };
    }

    // For each character, create a dropdown for them
    return (
        
        <div id="character-form">
            {characters.map((character) => {
                console.log("Rendering character:", character);
                // See if a performer is selected for this character
                const selectedPerfId = selections?.[character.id] ?? null
                const selectedOption = performerList.find((opt) => opt.value === selectedPerfId) ?? null

                // Create the div for each character
                return (
                    <div className="search-container" key={character.id}>
                        <p className="label">{character.name}</p>
                        <div className="search-div">
                            <Select 
                                options={performerList}
                                value={selectedOption}
                                onChange={(option) => { 
                                    const performerId = option ? option.value : null
                                    onSelectionChange(character.id, performerId)}}
                                isClearable
                                placeholder="Select a performer"
                                className="search"
                                />
                            <button type="button" className="add-performer" onClick={() => setPerfModalVisible(true)}>+</button>
                        </div>
                    </div>
                )
            })}
            <div className="search-container">
                <p className="label">Not listed?</p>
                <button onClick={() => setCharModalVisible(true)} className="button">Add New Character</button>
            </div>

            {charModalVisible && (
                <>
                    <div id="overlay"></div>
                    <AddCharacterModal onCloseChar={() => setCharModalVisible(false)} onCreateChar={handleCreateChar}/>
                </>
            )}

            {perfModalVisible && (
                <>
                    <div id="overlay"></div>
                    <AddPerformerModal onClose={() => setPerfModalVisible(false)} onCreate={handleCreatePerf}/>
                </>
            )}
        </div>
    )
}

export default CharPerfSelector;