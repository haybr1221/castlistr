import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'
import DisplayCharacters from '../components/DisplayCharacters.jsx'
import DisplayTours from '../components/DisplayTours.jsx'
import AddCharacterModal from '../components/AddCharacterModal.jsx'
import AddTourModal from '../components/AddTourModal.jsx'
import UploadPoster from '../components/UploadPoster.jsx'

function ShowPage() {
    const { slug } = useParams()
    // Character
    const [charLoading, setCharLoading] = useState(true)
    const [charError, setCharError] = useState(null)
    const [characters, setCharacters] = useState([])
    const [charModalVisible, setCharModalVisible] = useState(false)
    const [tours, setTours] = useState([])
    const [tourLoading, setTourLoading] = useState(true)
    const [tourError, setTourError] = useState(null)
    const [tourModalVisible, setTourModalVisible] = useState(false)
    const [poster, setPoster] = useState(null)
    const [posterLoading, setPosterLoading] = useState(true)
    const [title, setTitle] = useState()
    const [showId, setShowId] = useState()
    const [castListCount, setCastListCount] = useState(0)
    const [currentTab, setCurrentTab] = useState('characters')
    
    const { user } = useCurrentUser()

    useEffect(() => {
        // Fetch data
        setCharLoading(true)
        setTourLoading(true)

        fetch(`http://localhost:3000/show-info/${slug}`)
        .then(response => response.json())
        .then((data) => {
            setCharacters(data.charData)
            setCharLoading(false)
            setTours(data.tourData)
            setTourLoading(false)
            setPoster(data.show.poster_url)
            setPosterLoading(false)
            setTitle(data.show.title)
            setCastListCount(data.castListCount)
            setShowId(data.show.id)
        })
        .catch((error) => {
            console.error("Error fetching show info: ", error)
            setCharError(error)
            setTourError(error)
            setCharLoading(false)
            setTourLoading(false)
            setPosterLoading(false)
        })
    }, [slug])

    async function handleCreateChar(name, isMultiple) {

        // Insert into characters
        const { data, error } = await supabase
            .from("character")
            .insert({
                name: name,
                user_id: user.id
            })
            .select()

        if (error) throw error
        
        console.log("Data: ", data)
        const newCharId = data[0].id
        console.log("newCharId: ", newCharId)
        
        // Insert into show_has_character
        const { error: showCharError } = await supabase
            .from("show_has_character")
            .insert({
                show_id: showId,
                char_id: newCharId,
                user_id: user.id
            })

        if (showCharError) throw showCharError

        setCharacters(prev => [...prev, data[0]])

        if (!isMultiple) {
            // If it isn't multiple, return
            setCharModalVisible(false)
            return
        }
    }

    async function handleCreateTour(info, isMultiple) {

        const newTour = {
            title: info[0],
            opening: info[1],
            show_id: showId,
            user_id: user.id
        }

        if (info[2])
            newTour.closing = info[2]

        // Insert into tours
        const { data, error } = await supabase
            .from("tour")
            .insert([newTour])
            .select()

        if (error) throw error
        
        setTours(prev => [...prev, data[0]])

        if (!isMultiple) {
            // If it isn't multiple, return
            setTourModalVisible(false)
            return
        }
    }

    async function handleUpload(newUrl) {
        setPoster(newUrl)
    }

    return (
        <main id="centering">
            <div id="show-main">
                <div id="show-info">
                    <div id="basic-info">
                        <div id="poster-div">
                            { posterLoading && (
                                <p className="text">Loading...</p>
                            )}
                            { poster && (
                                <img src={poster} alt={`Poster for ${title}`}/>
                            )}
                            { !poster && !posterLoading && (
                                <UploadPoster showId={showId} onUploaded={handleUpload}></UploadPoster>
                            )}
                        </div>
                    </div>
                    <div id="dynamic-info">
                        {/* Cast Lists */}
                        <p className="dynamic-info">{castListCount} {castListCount == 1 ? "Cast List": "Cast Lists" }</p>
                        {/* Characters */}
                        <p>{characters.length} {characters.length == 1 ? "Character": "Characters"}</p>
                        {/* Tours */}
                        <p>{tours.length} {tours.length == 1 ? "Tour": "Tours"}</p>
                    </div>
                </div>
                <div id="interesting-info">
                    <div id="tabs">
                    <p
                        id="characters"
                        className={currentTab === "characters" ? "tab active-tab" : "tab"}
                        onClick={() => setCurrentTab("characters")}>
                        Characters
                    </p>

                    <p
                        id="tours"
                        className={currentTab === "tours" ? "tab active-tab" : "tab"}
                        onClick={() => setCurrentTab("tours")}>
                        Tours
                    </p>
                    </div>
                    {currentTab == 'characters' && (                    
                        <div className="info-tab">
                        <button onClick={() => setCharModalVisible(true)}>Add Character</button>
                        {/* Display characters */}
                            {charLoading && <p>Loading...</p>}
                            {charError && (
                                <p>Error loading: {charError.message}</p>
                            )}
                            {!charLoading && !charError && <DisplayCharacters charList={characters}/>}
                        </div>
                    )}
                    {currentTab == 'tours' && (
                        <div className="info-tab">
                            <button onClick={() => setTourModalVisible(true)}>Add Tour</button>
                            {/* Display tours */}
                                {tourLoading && <p>Loading...</p>}
                                {tourError && (
                                    <p>Error loading: {tourError.message}</p>
                                )}
                                {!tourLoading && !tourError && <DisplayTours tourList={tours}/>}
                        </div>
                    )}
                </div>

                {charModalVisible && (
                    <>
                        <div id="overlay"></div>
                        <AddCharacterModal onCloseChar={() => setCharModalVisible(false)} onCreateChar={handleCreateChar}/>
                    </>
                )}

                {tourModalVisible && (
                    <>
                        <div id="overlay"></div>
                        <AddTourModal onCloseTour={() => setTourModalVisible(false)} onCreateTour={handleCreateTour}/>
                    </>
                )}
            </div>
        </main>
    )
}

export default ShowPage