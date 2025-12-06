import { Link } from 'react-router-dom'

function DisplayShows({shows}) {
    const defaultPosterUrl = "https://zanpecuhaoukjvjkvyxh.supabase.co/storage/v1/object/public/posters/default.png"

    return(
        <div id="shows">
            {shows.map((show) => {
                return (
                    <Link to={`${show.slug}`} key={show.id}>
                        <div className="show-div">
                            <img src={show.poster_url || defaultPosterUrl} alt={`Poster for ${show.title}`} />
                            <div className="show-summary">
                                <p className="show-title">{show.title}</p>
                                <p className="count">{show.cast_list_count} {show.cast_list_count == 1 ? "Cast List": "Cast Lists" }</p>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export default DisplayShows