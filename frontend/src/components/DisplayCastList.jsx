import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../config/currentUser.js'
import { supabase } from '../config/supabaseclient.js';
import ListOptionsModal from './ListOptionsModal.jsx';
import DisplayComment  from './DisplayComment.jsx';

function DisplayCastList({ castList }) {
    const showTitle = castList.show?.title;
    const [username, setUsername] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [creatorId, setCreatorId] = useState(null)
    const [error, setError] = useState(null)
    const [isLiked, setIsLiked] = useState(null)
    const [listModal, setListModal] = useState(false)
    const [isCommenting, setIsCommenting] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [listComments, setListComments] = useState(castList.user_comments)
    
    const { user, profile } = useCurrentUser()
    const commentsRef = useRef(null)

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
            if (!isCancelled) setIsLiked(isLiked)
        }

        loadLiked()

        return () => { isCancelled = true }
    }, [user, castList.id])

    useEffect(() => { 
        if (commentsRef.current) 
            { commentsRef.current.scrollTop = commentsRef.current.scrollHeight; } 
    }, [listComments]);

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

    async function handleSubmit() {
        // submit the comment into supabase

        const { data, error } = await supabase
            .from("user_comments")
            .insert({
                user_id: user.id,
                cast_list_id: castList.id,
                text: newComment
            })
            .select()

        if (error) throw error;

        setListComments(prev => [...prev, data[0]]) 

        setNewComment('')
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

            <Link to={`/cast-lists/${castList.id}`}>
                <div className="cast-list-body">
                    {castList.cast_list_entry?.map((entry) => {
                        const charName = entry.character.name
                        const perfName = entry.performer.full_name
                        
                        return (
                            <div className="charDiv" key={entry.id}>
                                <p className="character">{charName}</p>
                                {entry.performer.headshot_url && (<img src={entry.performer.headshot_url} className="headshot-url"></img>)}
                                <p className="performer">{perfName}</p>
                            </div>
                        )
                    })}
                </div>
            </Link>
            {/* Footer with interaction buttons */}
            <div className="cast-list-footer">
                <i role="button" className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"} onClick={toggleLike} />
                <i className={isCommenting ? "fa-solid fa-comment" : "fa-regular fa-comment"} onClick={() => isCommenting ? setIsCommenting(false) : setIsCommenting(true)}></i>
            </div>
            {isCommenting && (
                <>
                    <div className="prev-comments" ref={commentsRef}>
                        {listComments && listComments.map((comment) =>
                            <DisplayComment comment={comment}>
                            </DisplayComment>
                        )}
                    </div>

                    <div className="list-comment">
                        <img src={profile.avatar_url} className="commenting-avatar"></img>
                        <input 
                            name="new-comment"
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            required
                            placeholder="Type a comment here..."
                            />
                        <button type="button" onClick={handleSubmit}>Submit</button>
                    </div>
                </>
            )}
        </div>
    )
}

export default DisplayCastList
