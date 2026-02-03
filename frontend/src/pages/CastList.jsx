import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DisplayCastList from '../components/DisplayCastList'

function CastListPage() {
    // Display a cast list on its own page
    const { id } = useParams()
    const [castList, setCastList] = useState(null)
    const [castListError, setCastListError] = useState(null)

    useEffect(() => {
        // Fetch the cast list
        fetch(`http://localhost:3000/get-list/${id}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            setCastList(data)
        })
        .catch((err) => {
            console.error("Error fetching list: ", err)
            setCastListError(err)
        })

    }, [id])

    useEffect(() => { 
        document.title = `${castList} - castlistr`; }, 
        []
    ), [castList];

    if (!castList) {
        return <p>Loading cast list...</p>
    }

    return (
        <main id="centering">
            <DisplayCastList castList={castList}/>
        </main>
    )
}

export default CastListPage