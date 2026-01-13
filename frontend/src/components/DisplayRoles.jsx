function DisplayRole({rolesList}) {
    return (
        <ul id="role-list">
            {rolesList.map((role) => {
                return (
                    <li key={role.id}>
                        {role.character.name}
                        {role.cover_status}
                        {role.arrived}
                        {role.left}
                        {role.tour.title}
                        {role.tour.show.title}
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayRole