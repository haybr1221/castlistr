import { Link } from 'react-router-dom'

function DisplayPerformers({performers}) {
    return (
        <table id="performer-table">
            <thead>
                <tr>
                    <th className="col-name">Full Name</th>
                    <th className="col-count">Cast List Count</th>
                </tr>
            </thead>
            <tbody>
                {performers.map((performer) => (
                    <tr className="perf-row" key={performer.id}>
                        <td className="perf-link">
                            <Link to={`${performer.slug}`} >
                                <p className="perf-name">{performer.full_name}</p>
                            </Link>
                        </td>
                        <td>
                            <p className="count">{performer.cast_list_count}</p>
                        </td>
                    </tr>
                    )
                )}
            </tbody>
        </table>
    )
}

export default DisplayPerformers