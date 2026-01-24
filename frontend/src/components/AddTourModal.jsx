import { useState } from 'react'

function AddTourModal({ onCloseTour, onCreateTour }) {
    // Adding a new tour
    const [newTour, setNewTour] = useState('')
    const [openingDate, setOpeningDate] = useState('')
    const [closingDate, setClosingDate] = useState('')
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        // Reset messages
        setFormError(null)
        setMultipleMsg('')

        // First check if this already exists in the database
        if (!newTour) {
            setFormError("There must be a title.")
            return
        }

        if (!openingDate) {
            setFormError("There must be an opening date.")
            return
        }

        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"
        const tourInfo = [newTour, openingDate, closingDate]

        onCreateTour(tourInfo, isMultiple)
        
        if (!isMultiple) {
            onCloseTour()
        } else {
            setMultipleMsg(`Success! ${newTour} has been added.`)
        }
        
        setNewTour('')
    }

    return(
        <div id="add-modal">
            <p className="cancel" onClick={onCloseTour}>X</p>
            <h1 className="adding-new-title">Create a Tour</h1>
            <form onSubmit={handleSubmit}>
                <label className="label" htmlFor="newTour">Tour Name:</label>
                <input 
                    type="text"
                    name="newTour"
                    value={newTour}
                    onChange={e => setNewTour(e.target.value)}
                />
                <label htmlFor="opening" className="label">Opening Date:</label>
                <input 
                    type="date"
                    name="opening"
                    value={openingDate}
                    onChange={e => setOpeningDate(e.target.value)}>
                </input>
                <label htmlFor="closing" className="label">Closing Date:</label>
                <input
                    type="date"
                    name="closing"
                    value={closingDate}
                    onChange={e => setClosingDate(e.target.value)}>
                </input>
                {formError && <div id="form-error" className="text">{formError}</div>}
                {multipleMsg && <div className="text">{multipleMsg}</div>}
                <div id="button-box">
                    <button type="submit" name="create">Create</button>
                    <button type="submit" name="createAnother">Create &amp; Create Another</button>
                </div>
            </form>
        </div>
    )
}

export default AddTourModal