import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'

function DisplayComment({ comment }) {
    const [commentUser, setCommentUser] = useState({})
    
    useEffect(() => {
        if (!comment.user_id) return

        fetch(`${API_URL}/get-profile/${comment.user_id}`)
        .then(response => response.json())
        .then((data) => {
            setCommentUser(data)
        })
        .catch((error) => {
            console.error("Error fetching user for this comment: ", error)
        })
    }, [comment.user_id])

    return (
        <div className="comment" key={comment.id}>
            <img src={commentUser.avatar_url} alt={`Profile picture for ${commentUser.username}`} className="comment-avatar" />
            <div className="comment-body">
                <p className="comment-username">
                    {commentUser.username}
                </p>
                <p className="comment-text">
                    {comment.text}
                </p>
            </div>
        </div>
    )
}

export default DisplayComment