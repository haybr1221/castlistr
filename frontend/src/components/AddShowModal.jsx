/* Add a show */

import { useState } from 'react'

function AddShowModal({ onClose, onCreate }) {
    // Adding a new show
    const [newShow, setNewShow] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        // reset messages
        setFormError(null)
        setMultipleMsg('')
        
        if (!newShow) {
            // this is required!
            setFormError("There must be a title.")
            return
        }

        // do we need to do this again?
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
        <div className="modal">
            <button className="cancel" onClick={onClose}>
                &times;
            </button>
            <h1 className="adding-new-title">
                Create a Show
            </h1>
            <form onSubmit={handleSubmit}>
                <label className="label" htmlFor="newShowTitle">
                    Title:
                </label>
                <input
                    type="text"
                    name="newShowTitle"
                    value={newShow}
                    onChange={e => setNewShow(e.target.value)}
                />
                {formError && 
                    <div id="form-error" className="text">
                        {formError}
                    </div>}
                {multipleMsg && 
                    <div className="text">
                        {multipleMsg}
                    </div>}
                <div id="button-box">
                    <button type="submit" name="create" className="button">
                        Create
                    </button>
                    <button type="submit" name="createAnother" className="button">
                        Create &amp; Create Another
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddShowModal