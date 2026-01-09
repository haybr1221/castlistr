import { useState } from 'react'
import { supabase } from '../config/supabaseclient'
import { Link } from 'react-router-dom'

function ListOptionsModal({ onClose, currUserId, listId, creatorId }) {
    // List options modal

    async function deleteList() {
        // TODO: add confirmation popup
        // does this need to be its own modal? probably
        
        const { error } = await supabase
            .from("cast_lists")
            .delete()
            .eq("user_id", creatorId)
            .eq("id", listId)

        if (error) throw error

        console.log("deleted")
    }

    return(
        <div className="list-options text">
            { currUserId == creatorId && (
                <>
                    <Link to={`/cast-lists/${listId}/edit`}>Edit List</Link>
                    <p onClick={deleteList}>Delete List</p>
                </>
            )}
            <p className="red-text">Report List</p>
            { currUserId != creatorId && (
                <>
                    <p className="red-text">Block User</p>
                </>
            )}
        </div>
    )
}

export default ListOptionsModal