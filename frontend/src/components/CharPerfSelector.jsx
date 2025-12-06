import Select from "react-select"

function CharPerfSelector({ characters, performers, selections, onSelectionChange }) {
    // Create the list of performers to use
    const performerList = performers.map((performer) => ({
        value: performer.id,
        label: performer.full_name
    }))

    // For each character, create a dropdown for them
    return (
        <div id="character-form">
            {characters.map((character) => {
                // See if a performer is selected for this character
                const selectedPerfId = selections?.[character.id] ?? null
                const selectedOption = performerList.find((opt) => opt.value === selectedPerfId) ?? null

                // Create the div for each character
                return (
                    <div className="search-container" key={character.id}>
                        <p className="label">{character.name}</p>
                        <Select 
                            options={performerList}
                            value={selectedOption}
                            onChange={(option) => { 
                                const performerId = option ? option.value : null
                                onSelectionChange(character.id, performerId)}}
                            isClearable
                            placeholder = "Select a performer"
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default CharPerfSelector;