
function DisplayTours({tourList}) {
    return(
        <ul id="tour-list">
            {tourList.map((tour) => {
                return (
                    <li key={tour.id} className="tour-info">
                        {tour.title}
                        <div className="tour-dates">
                            <p><span className="date-label">Opening: </span>{tour.opening}</p>
                            {tour.closing && (
                                <p><span className="date-label">Closing: </span>{tour.closing}</p>
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayTours