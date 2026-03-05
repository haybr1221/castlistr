// Display the roles of a performer where they have been a specific character

function PerformerCreditModal({ data, onClose }) {
    // set the perf name and char name for ease of use
    const perfName = data.credits[0].performer.full_name
    const charName = data.credits[0].character.name
    const credits = data.credits

    console.log(data)
    return (
        <div id="credit-modal">
            <button onClick={onClose} className="cancel">&times;</button>
            <h1 id="actor-as-char">{perfName} as {charName}</h1>

            <ul id="role-list">
                {credits.map((role) => {
                    return (
                        <li className="role-box" key={role.id}>
                            <div className="role-info">
                                <p><span className="tour-title">{role.tour.title}</span>
                                    <br/>
                                    {role.cover_status}
                                </p>
                                <div className="role-dates">
                                    {role.arrived && (
                                        <p><span className="date-label">Arrived: </span>{role.arrived}</p>
                                    )}
                                    {role.left && (
                                        <p><span className="date-label">Left: </span>{role.left}</p>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default PerformerCreditModal