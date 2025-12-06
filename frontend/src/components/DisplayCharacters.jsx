function DisplayCharacters({charList}) {
    return(
        <ul id="char-list">
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