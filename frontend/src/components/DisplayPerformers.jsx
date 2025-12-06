function DisplayPerformers({performers}) {
    return (
        <div id="performers">
            {performers.map((performer) => {
                return (
                    <li key={performer.id}>
                        {performer.full_name}
                    </li>
                )
            })}
        </div>
    )
}

export default DisplayPerformers