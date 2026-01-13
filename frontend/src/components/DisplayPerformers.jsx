import { Link } from 'react-router-dom'

function DisplayPerformers({performers}) {
    console.log(performers)
    return (
        <div id="performers">
            {performers.map((performer) => {
                return (
                    <Link to={`${performer.slug}`} key={performer.id}>
                        <li key={performer.id}>
                            {performer.full_name}
                        </li>
                    </Link>
                )
            })}
        </div>
    )
}

export default DisplayPerformers