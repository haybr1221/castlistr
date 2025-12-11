import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../config/currentUser.js'
import { supabase } from '../config/supabaseclient.js';
import ListOptionsModal from './ListOptionsModal.jsx';

function DisplayCastList({ castList }) {
    const showTitle = castList.show?.title;
    const [username, setUsername] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [creatorId, setCreatorId] = useState(null)
    const [error, setError] = useState(null)
    const [isLiked, setIsLiked] = useState(null)
    const [listModal, setListModal] = useState(false)

    const { user } = useCurrentUser()

    useEffect(() => {
        if (!castList.user_id) return

        let isCancelled = false

        async function loadProfile() {
            try {
                setError(null)
                const response = await fetch(`http://localhost:3000/get-profile/${castList.user_id}`)
                if (!response.ok)
                {
                    throw new Error(`Error fetching profile for ${castList.user_id}`)
                }
                const data = await response.json()
                
                if (!isCancelled)
                {
                    setUsername(data.username)
                    setAvatarUrl(data.avatar_url)
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

    useEffect(() => {
        if (!user) return

        let isCancelled = false

        async function loadLiked() {
            const response = await fetch(`http://localhost:3000/get-likes/${user.id}/${castList.id}`)
            const isLiked = await response.json()
            console.log
            if (!isCancelled) setIsLiked(isLiked)
        }

        loadLiked()

        return () => { isCancelled = true }
    }, [user, castList.id])

    async function toggleLike() {
        if (!isLiked)
        {
            // It is not liked yet, so add it to the table
            const { error } = await supabase
                .from("user_likes")
                .insert({
                    user_id: user.id,
                    cast_list_id: castList.id
                })

            if (error) throw error

            // We know it is now liked
            setIsLiked(true)
        }
        else
        {
            // It is already liked, so delete from the table
            const { error } = await supabase
                .from("user_likes")
                .delete()
                .eq("user_id", user.id)
                .eq("cast_list_id", castList.id)

            if (error) throw error

            // We know it is now unliked
            setIsLiked(false)
        }
    }
    return (
        <div className="cast-list-card">
            <Link to={username ? `/users/${username}` : '#'} className="profile-link">
                <div className="list-header">
                    <img
                        src={avatarUrl}
                        alt={`Profile picture for ${username}`}
                        className="list-avatar"
                    />
                    <div className="title-div">
                        <p className="list-title">{castList.title}</p>
                        <p className="list-subtitle">
                            {`${username}'s cast for ${showTitle}`}
                        </p>
                    </div>
                    <i className="fa-solid fa-ellipsis" role="button" onClick={listModal ? () => setListModal(false) : () => setListModal(true)}></i>
                </div>
            </Link>

            {listModal && (
                <>
                    <div id="list-overlay"></div>
                    <ListOptionsModal currUserId={user.id} listId={castList.id} creatorId={creatorId}/>
                </>
            )}

            <div className="cast-list-body">
                {castList.cast_list_entry?.map((entry) => {
                    const charName = entry.character.name
                    const perfName = entry.performer.full_name

                    return (
                        <div className="charDiv" key={entry.id}>
                            <p className="character">{charName}</p>
                            <p className="performer">{perfName}</p>
                        </div>
                    )
                })}

            </div>
            {/* Footer with interaction buttons */}
            <div className="cast-list-footer">
                <i role="button" className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"} onClick={toggleLike} />
            </div>
        </div>
    )
}

export default DisplayCastList
