import { useState, useEffect } from 'react'
import Select from "react-select"

function ShowDropdown({ value, onChange }) {
    const [shows, setShows] = useState(null)

    useEffect(() => {
        fetch('http://localhost:3000/show-titles')
        .then((response => response.json()))
        .then((data) => {
            const options = data.map((show) => ({
                value: show.id,
                label: show.title
            }))
            setShows(options)
        })
        .catch((err) => {
            console.error("Error fetching cast lists: ", err)
        })
    }, [])

    return (
        <Select 
            options={shows}
            value={value}
            onChange={onChange}
            placeholder="Select a show.."
        />
    )
}

export default ShowDropdown