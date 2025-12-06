function DisplayTours({tourList}) {
    return(
        <ul id="tour-list">
            {tourList.map((tour) => {
                return (
                    <li key={tour.id}>
                        {tour.title}
                        {tour.opening}
                        {tour.closing}
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayTours