import { useState } from 'react'

function AddShowModal({ onClose, onCreate }) {
    // Adding a new show
    const [newShow, setNewShow] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        // Reset messages
        setFormError(null)
        setMultipleMsg('')

        // TODO: check if this already exists in the database
        
        if (!newShow) {
            setFormError("There must be a title.")
            return
        }

        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"

        const result = await onCreate(newShow, isMultiple)

        if (!result.ok)
        {
            setFormError(result.error)
            setNewShow('')
            return
        }
        
        if (!isMultiple) {
            onClose()
        } else {
            setMultipleMsg(`Success! ${newShow} can now have cast lists.`)
        }
        
        setNewShow('')
    }

    return(
        <div id="add-modal">
            <p className="cancel" onClick={onClose}>X</p>
            <h1 className="adding-new-title">Create a Show</h1>
            <form onSubmit={handleSubmit}>
                <label className="label">Title:</label>
                <input
                    type="text"
                    value={newShow}
                    onChange={e => setNewShow(e.target.value)}
                />
                {formError && <div id="form-error" className="text">{formError}</div>}
                {multipleMsg && <div className="text">{multipleMsg}</div>}
                <div id="button-box">
                    <button type="submit" name="create" className="button">Create</button>
                    <button type="submit" name="createAnother" className="button">Create &amp; Create Another</button>
                </div>
            </form>
        </div>
    )
}

export default AddShowModal