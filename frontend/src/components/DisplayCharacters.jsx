function DisplayCharacters({charList}) {
    return(
        <ul className="display-list">
            {charList.map((char) => {
                return (
                    <li key={char.id}>
                        {char.name}
                    </li>
                )
            })}
        </ul>
    )
}

export default DisplayCharacters