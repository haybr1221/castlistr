/* Add a new character to a show */
import { useState } from 'react'

function AddCharacterModal({ onCloseChar, onCreateChar }) {
    const [charName, setCharName] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        // reset messages
        setFormError(null)
        setMultipleMsg('')

        if (!charName) {
            // this is required!
            setFormError("The character must have a name.")
            return
        }

        // do we need to do this again?
        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"

        // use the parent to add to database
        const result = await onCreateChar(charName, isMultiple) 
        
        // If something went wrong, log it
        if (!result.ok) { 
            setFormError(result.error) // display the error
            setCharName('') // reset charName
            return 
        }

        if (!isMultiple) onCloseChar() // only one, so close it
        else {
            // Make sure the user knows it is ready to add another
            setMultipleMsg(`Success! ${charName} can be used cast.`) // give the user the OK to add another
        }

        setCharName('') // reset charName
    }

    return(
        <div id="add-modal">
            <p className="cancel" onClick={onCloseChar}>X</p>
            <h1 className="adding-new-title">Add a Character</h1>
            <form id="char-form" onSubmit={handleSubmit}>
                <label className="label">Character Name:</label>
                <input type="text" value={charName} onChange={e => setCharName(e.target.value)}/>
                {formError && <div id="form-error" className="text">{formError}</div>}
                {multipleMsg && <div className="text">{multipleMsg}</div>}
                <div id="button-box">
                    <button type="submit" name="create" className="button">Create</button>
                    <button type="submit" name="createAnother" className="button">Create & Create Another</button>
                </div>
            </form>
        </div>
    )
}

export default AddCharacterModal