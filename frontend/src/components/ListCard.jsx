/* Compact card for a cast list, used in galleries (e.g. the profile page) */

import { Link } from 'react-router-dom'

// How many character/performer pairs to preview before "+N more"
export const MAX_PREVIEW = 4

function ListCard({ castList }) {
    const entries = castList.cast_list_entry ?? []
    const preview = entries.slice(0, MAX_PREVIEW)
    const extra = entries.length - preview.length

    return (
        <Link to={`/cast-lists/${castList.id}`} className="list-card">
            <p className="list-card-title">{castList.title}</p>
            <p className="list-card-show">{castList.show?.title}</p>
            <ul className="list-card-entries">
                {preview.map((entry) => (
                    <li key={entry.id}>
                        <span className="list-card-character">{entry.character?.name}</span>
                        <span className="list-card-performer">{entry.performer?.full_name}</span>
                    </li>
                ))}
            </ul>
            {extra > 0 && <p className="list-card-more">+{extra} more</p>}
        </Link>
    )
}

export default ListCard
