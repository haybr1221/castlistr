
function DisplayTours({tourList}) {
    return(
        <ul className="display-list">
            {tourList.map((tour) => {
                return (
                    <li key={tour.id}>
                        {tour.title}
                        <div className="info-with-dates">
                            {tour.opening && (
                                <p>
                                    <span className="date-label">
                                        Opening: 
                                    </span> {tour.opening}
                                </p>
                            )}
                            {tour.closing && (
                                <p>
                                    <span className="date-label">
                                        Closing: 
                                    </span> {tour.closing}
                                </p>
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayTours