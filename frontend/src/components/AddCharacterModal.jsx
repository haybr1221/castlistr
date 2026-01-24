import { useState } from 'react'

function AddCharacterModal({ onCloseChar, onCreateChar }) {
    // Adding a new character to a show
    const [charName, setCharName] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        // Reset messages
        setFormError(null)
        setMultipleMsg('')

        // Check if charName is null
        if (!charName) {
            setFormError("The character must have a name.")
            return
        }

        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"

        onCreateChar(charName, isMultiple)

        if (!isMultiple) {
            // Only adding one, so close the modal
            onCloseChar()
        }
        else {
            setMultipleMsg(`Success! ${charName} can be used cast.`)
        }

        // Reset the character name
        setCharName('')
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
                    <button type="submit" name="create">Create</button>
                    <button type="submit" name="createAnother">Create & Create Another</button>
                </div>
            </form>
        </div>
    )
}

export default AddCharacterModal