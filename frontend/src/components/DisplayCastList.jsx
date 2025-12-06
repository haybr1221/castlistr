import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function DisplayCastList({ castList }) {
    const showTitle = castList.show?.title;
    const [username, setUsername] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [error, setError] = useState(null)

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
                </div>
            </Link>

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
                <i className="fa fa-heart" />
            </div>
        </div>
    )
}

export default DisplayCastList
