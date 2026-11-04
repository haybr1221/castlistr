/* Display a cast list */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../config/currentUser.js'
import { API_URL } from '../config/api'
import ListOptionsModal from './ListOptionsModal.jsx';
import { useScreenshot } from '../hooks/useScreenshot.js'

function DisplayCastList({ castList }) {
    const showTitle = castList.show?.title;
    const [username, setUsername] = useState(null)
    const [creatorId, setCreatorId] = useState(null)
    const [error, setError] = useState(null)
    const [listModal, setListModal] = useState(false)
    const { capture } = useScreenshot()
    
    const { user, profile } = useCurrentUser()

    useEffect(() => {
        if (!castList.user_id) return

        let isCancelled = false

        async function loadProfile() {
            try {
                setError(null)
                const response = await fetch(`${API_URL}/get-profile/${castList.user_id}`)
                if (!response.ok)
                {
                    throw new Error(`Error fetching profile for ${castList.user_id}`)
                }
                const data = await response.json()
                
                if (!isCancelled)
                {
                    setUsername(data.username)
                    setCreatorId(data.id)
                }
            }
            catch (err) {
                if (!isCancelled) {
                    console.error("Error fetching profile: ", error)
                    setError(err)
                }
            }
        }

        loadProfile()

        return () => {
            isCancelled = true
        }

    }, [castList.user_id])

    const cardRef = useRef(null)

    // reset castlist for exporting
    const handleDownloadClick = async () => {
        setListModal(false) // make sure dropdown is closed, we don't want it there!
        cardRef.current.classList.add('capturing') // add css class for capture styling
        try {
            await capture(cardRef.current, {
                format: 'png',
                filename: `cast-list-${castList.id}`,
            })
        } finally {
            cardRef.current.classList.remove('capturing') // remove css class after capture
        }
    }

    return (
        <div className="cast-list-card" ref={cardRef}>
            <div className="list-header">
                <Link to={username ? `/users/${username}` : '#'} className="profile-link">
                    <div className="title-div">
                        <p className="list-title">
                            {castList.title}
                        </p>
                        <p className="list-subtitle">
                            {`${username}'s cast for`} <span className="show-title-cast-list">{`${showTitle}`}</span>
                        </p>
                    </div>
                </Link>
                <i className="fa-solid fa-ellipsis" role="button" onClick={listModal ? () => setListModal(false) : () => setListModal(true)}></i>
            </div>

            {listModal && (
                <>
                    <div id="list-overlay" onClick={() => setListModal(false)}></div>
                    <ListOptionsModal 
                        currUserId={user.id} 
                        listId={castList.id}
                        creatorId={creatorId}
                        onDownload={handleDownloadClick}
                    />
                </>
            )}

            <Link to={`/cast-lists/${castList.id}`}>
                <div className="cast-list-body">
                    {castList.cast_list_entry?.map((entry) => {
                        const charName = entry.character.name
                        const perfName = entry.performer.full_name
                        
                        return (
                            <div className="char-div" key={entry.id}>
                                <p className="character">
                                    {charName}
                                </p>
                                {entry.performer.headshot_url && (<img src={entry.performer.headshot_url} className="headshot-url"/>)}
                                <p className="performer">{perfName}</p>
                            </div>
                        )
                    })}
                </div>
            </Link>
        </div>
    )
}

export default DisplayCastList
