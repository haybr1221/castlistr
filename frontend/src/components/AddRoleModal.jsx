import { useState, useEffect } from 'react'
import Select from 'react-select'
import ShowDropdown from '../components/ShowDropdown.jsx'

function AddRoleModal({ onClose, onCreate }) {
    const [roleInfo, setRoleInfo] = useState({
        charId: "",
        tourId: "",
        cover_status: "",
        arrivedDate: "",
        leftDate: ""
    })
    const [characters, setCharacters] = useState([])
    const [tours, setTours] = useState([])
    const [show, setShow] = useState("")
    const [formError, setFormError] = useState(null)
    const [multipleMsg, setMultipleMsg] = useState("")

    function handleSubmit(e) {
        console.log("uou called?")
        e.preventDefault()

        // Reset messages
        setFormError(null)
        setMultipleMsg('')

        if (!roleInfo.charId) {
            setFormError("A character is required.")
            return
        }

        if (!roleInfo.tourId) {
            setFormError("A tour is required.")
            return
        }

        if (!roleInfo.cover_status) {
            setFormError("A cover status is required.")
            return
        }

        if (!roleInfo.arrivedDate) {
            setFormError("An arrival date is required.")
            return
        }

        const isMultiple = e.nativeEvent.submitter?.name === "createAnother"
        onCreate(roleInfo, isMultiple)

        if (!isMultiple) {
            onClose()
        } else {
            setMultipleMsg(`Success! This role has been added.`)
        }

        setRoleInfo({})
    }

    useEffect(() => {
        // Fetch characters only if a show has been selected
        if (!show) return
        // in case the show is changed, reset role info
        setRoleInfo({})
        
        fetch(`http://localhost:3000/show/${show?.value}/characters`)
        .then((response => response.json()))
        .then((data) => {
            const options = data.map((char) => ({
                value: char.id,
                label: char.name
            }))
            setCharacters(options)
        })
    }, [show])

    useEffect(() => {
        // Fetch tours only if a show has been selected
        if (!show) return

        // in case the show is changed, reset role info
        setRoleInfo({})
        
        fetch(`http://localhost:3000/tour/${show?.value}`)
        .then((response => response.json()))
        .then((data) => {
            const options = data.map((tour) => ({
                value: tour.id,
                label: tour.title
            }))
            setTours(options)
        })
    }, [show])

    console.log("roleInfo: ", roleInfo)

    return (
        <div id="add-modal">
            <p className="cancel" onClick={onClose}>X</p>
            <h1 className="adding-new-title">Create a Role</h1>
            <form onSubmit={handleSubmit}>
                <label className="label" htmlFor="charName"></label>
                <ShowDropdown
                    value={show}
                    onChange={setShow}/>
                
                { show && (
                    // once show is selected, display character dropdown
                    <>
                        <Select 
                            options={characters}
                            value={characters.find(c => c.value === roleInfo.charId) || null}
                            onChange={(option) => setRoleInfo(prev => ({ ...prev, charId: option?.value })) }
                            placeholder="Select a character..."
                        />
                    </>
                )}
                { show && (
                    // once show is selected, display tour dropdown
                    <>
                        <Select 
                            options={tours}
                            value={tours.find(c => c.value === roleInfo.tourId) || null}
                            onChange={(option) => setRoleInfo(prev => ({ ...prev, tourId: option?.value })) }
                            placeholder="Select a tour..."
                        />
                    </>
                )}
                { roleInfo.charId && roleInfo.tourId && (
                    <>
                        <label htmlFor="" className="label">Cover status: </label>
                        <select
                            value={roleInfo.cover_status}
                            onChange={e => setRoleInfo(prev => ({ ...prev, cover_status: e.target.value}))}
                            placeholder="Select a cover status"
                        >
                            <option value="
                            ">Select</option>
                            <option value="original">Original</option>
                            <option value="replacement">Replacement </option>
                            <option value="temporary replacement">Temporary Replacement</option>
                        </select>
                    </>
                )}
                { roleInfo.cover_status && (
                    // once a cover status is selected, display date selection
                    <>
                        <label htmlFor="arrivedDate" className="label">Arrived:</label>
                        <input 
                            type="date"
                            name="arrivedDate"
                            value={(roleInfo.arrivedDate)}
                            onChange={e => setRoleInfo(prev => ({ ...prev, arrivedDate: e.target.value}))}>
                        </input>
                        <label htmlFor="left" className="label">Left Date:</label>
                        <input
                            type="date"
                            name="leftDate"
                            value={(roleInfo.leftDate)}
                            onChange={e => setRoleInfo(prev => ({ ...prev, leftDate: e.target.value }))}>
                        </input>
                    </>
                )}
                {formError && <div id="form-error" className="text">{formError}</div>}
                <div id="button-box">
                    <button type="submit" name="create" className="button">Create</button>
                    <button type="submit" name="createAnother" className="button">Create &amp; Create Another</button>
                </div>
            </form>
        </div>
    )
}

export default AddRoleModal