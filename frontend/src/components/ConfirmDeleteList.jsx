// Confirm List Deletion

function ConfirmDeleteList({ onConfirm, onClose }) {
    return (
        <>
            <div id="delete-conf">
                <p className="cancel" onClick={onClose}>X</p>
                <h1 className="confirm-delete">Are you sure?</h1>
                <p className="text">This action annot be undone.</p>
                <form onSubmit={onConfirm}>
                    <div id="button-box">
                        <button id="delete-yes" type="submit" name="yes" onClick={onConfirm}>Yes</button>
                        <button type="submit" name="no" className="button" onClick={onClose} id="delete-no">No</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default ConfirmDeleteList