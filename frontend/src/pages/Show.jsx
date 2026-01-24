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
    const [charModalVisible, setCharModalVisible] = useState(false)
    const [tourLoading, setTourLoading] = useState(true)
    const [tourError, setTourError] = useState(null)
    const [tourModalVisible, setTourModalVisible] = useState(false)
    const [posterLoading, setPosterLoading] = useState(true)
    const [currentTab, setCurrentTab] = useState('characters')
    const [showData, setShowData] = useState({
        characters: [],
        tours: [],
        poster: "",
        title: "",
        showId: null
    })
    // const [userLoading, setUserLoading] = useState(true)
    const navigate = useNavigate()

    const { user, profile } = useCurrentUser()

    // useEffect(() => {
    //     if (userLoading) return

    //     if (!user) {
    //         // send to signin or index
    //         navigate("/signin")
    //         return
    //     }

    //     if (!profile?.username) {
    //         // send to edit profile
    //         navigate("/edit-profile")
    //     }
    // }, [userLoading, user, profile, navigate])

    // if (userLoading || !user || !profile?.username) {
    //     return null 
    // }

    useEffect(() => {
        // Fetch data
        setCharLoading(true)
        setTourLoading(true)

        fetch(`http://localhost:3000/show-info/${slug}`)
        .then(response => response.json())
        .then((data) => {
            setShowData({
                characters: (data.charData),
                tours: (data.tourData),
                poster: (data.show.poster_url),
                title: (data.show.title),
                castListCount: (data.castListCount),
                showId: (data.show.id)
            })
            setTourLoading(false)
            setCharLoading(false)
            setPosterLoading(false)
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
        
        const newCharId = data[0].id
        
        // Insert into show_has_character
        const { error: showCharError } = await supabase
            .from("show_has_character")
            .insert({
                show_id: showData.showId,
                char_id: newCharId,
                user_id: user.id
            })

        if (showCharError) throw showCharError

        setShowData(prev => ({ 
            ...prev, 
            characters: [...prev.characters, data[0]]})
        )

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
            show_id: showData.showId,
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
        
        setShowData(prev => ({ 
            ...prev, 
            tours: [...prev.tours, data[0]]})
        )

        if (!isMultiple) {
            // If it isn't multiple, return
            setTourModalVisible(false)
            return
        }
    }

    async function handleUpload(newUrl) {
        setShowData(prev => ({ 
            ...prev, 
            poster: newUrl })
        )
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
                            { showData.poster && (
                                <img src={showData.poster} alt={`Poster for ${showData.title}`}/>
                            )}
                            { !showData.poster && !posterLoading && (
                                <UploadPoster showId={showData.showId} onUploaded={handleUpload} />
                            )}
                        </div>
                    </div>
                    <div id="dynamic-info">
                        {/* show title */}
                        <p className="show-title">{showData.title}</p>
                        {/* Cast Lists */}
                        <p className="dynamic-info">{showData.castListCount} {showData.castListCount == 1 ? "Cast List": "Cast Lists" }</p>
                        {/* Characters */}
                        <p>{showData.characters.length} {showData.characters.length == 1 ? "Character": "Characters"}</p>
                        {/* Tours */}
                        <p>{showData.tours.length} {showData.tours.length == 1 ? "Tour": "Tours"}</p>
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
                            {!charLoading && !charError && <DisplayCharacters charList={showData.characters}/>}
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
                                {!tourLoading && !tourError && <DisplayTours tourList={showData.tours}/>}
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