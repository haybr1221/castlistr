import { useState } from 'react'

function AddPerformerModal({ onClose, onCreate }) {
    const [perfName, setPerfName] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        // Reset messages
        setFormError(null)
        setMultipleMsg('')

        // TODO: check if already in the database

        if (!perfName) {
            // Make sure perfName exists
            setFormError("Performers must have a name.")
            return
        }

        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"

        onCreate(perfName, isMultiple)

        if (!isMultiple)
            onClose()
        else
            setMultipleMsg(`Success! ${perfName} can now have cast lists.`)

        setPerfName('')
    }

    return (
        <div id="add-modal">
            <p className="cancel" onClick={onClose}>x</p>
            <h1 className="adding-new-title">Create a Performer</h1>
            <form onSubmit={handleSubmit}>
                <label className="label" htmlFor="perfName">Title:</label>
                <input
                    type="text"
                    name="perfName"
                    value={perfName}
                    onChange={e => setPerfName(e.target.value)}
                />
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

export default AddPerformerModal