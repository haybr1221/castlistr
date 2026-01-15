function DisplayRole({rolesList}) {
    return (
        <ul id="role-list">
            {rolesList.map((role) => {
                return (
                    <li className="role-box">
                        <p className="role-show-title">{role.tour.show.title}</p>
                        <div className="role-info">
                            <p>{role.character.name} <span className="cover-status">({role.cover_status})</span> <br></br>
                            {role.tour.title}
                            </p>
                            <div className="role-dates">
                                <p><span className="date-label">Arrived: </span>{role.arrived}</p>
                                {role.left && (
                                <p><span className="date-label">Left: </span>{role.left}</p>
                                )}
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayRole