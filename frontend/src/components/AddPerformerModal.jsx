/* Add a performer */

import { useState } from 'react'

function AddPerformerModal({ onClose, onCreate }) {
    const [perfName, setPerfName] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        // reset messages
        setFormError(null)
        setMultipleMsg('')

        if (!perfName) {
            // this is required!
            setFormError("Performers must have a name.")
            return
        }

        // do we need to do this again?
        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"

        // use the parent to add to database
        const result = await onCreate(perfName, isMultiple)

        if (!result.ok) {
            setFormError(result.error) // display the error
            setPerfName('') // reset perfName
            return
        }

        if (!isMultiple) onClose() // only one, so close it
        else
            setMultipleMsg(`Success! ${perfName} can now have cast lists.`) // give the user the OK to add another

        setPerfName('') // reset perfName
    }

    return (
        <div id="add-modal">
            <p className="cancel" onClick={onClose}>x</p>
            <h1 className="adding-new-title">Create a Performer</h1>
            <form onSubmit={handleSubmit}>
                <label className="label" htmlFor="perfName">Full Name:</label>
                <input
                    type="text"
                    name="perfName"
                    value={perfName}
                    onChange={e => setPerfName(e.target.value)}
                />
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

export default AddPerformerModal