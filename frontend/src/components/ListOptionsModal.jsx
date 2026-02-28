import { supabase } from '../config/supabaseclient'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ConfirmDeleteList from '../components/ConfirmDeleteList.jsx'

function ListOptionsModal({ currUserId, listId, creatorId }) {
    const [ isPinned, setIsPinned ] = useState(false)
    const [ confirmDeleteModal, setConfirmDeleteModal ] = useState(false)

    useEffect(() => {
        async function fetchIsPinned() {
            // check if this list is already pinned
            const { data, error } = await supabase
                .from("cast_lists")
                .select("is_pinned")
                .eq("id", listId)
                .single()

            if (!error && data) setIsPinned(data.is_pinned)
        }

        fetchIsPinned()
    }, [listId])

    async function deleteList() {
        setConfirmDeleteModal(false)

        const { error } = await supabase
            .from("cast_lists")
            .delete()
            .eq("user_id", creatorId)
            .eq("id", listId)

        if (error) throw error
    }

    async function pinList() {
        // is the list already pinned?
        if (isPinned) {
            // unpin in!
            const { error } = await supabase
                .from("cast_lists")
                .update({is_pinned: false})
                .eq("user_id", currUserId)
                .eq("id", listId)

            if (error) throw error

            // reset isPinned, we just changed that
            setIsPinned(false)
            return
        }

        // it must not be pinned right now, so unpin the list that's there

        const {error: unPinError} = await supabase
            .from("cast_lists")
            .update({is_pinned: false})
            .eq("user_id", currUserId)
            .eq("is_pinned", true)

        if (unPinError) throw unPinError

        // now we can pin it
        const { error: pinError } = await supabase
            .from("cast_lists")
            .update({is_pinned: true})
            .eq("user_id", currUserId)
            .eq("id", listId)

        if (pinError) throw error
    }

    return(
        <>       
            {confirmDeleteModal && (
                <>
                    <div id="overlay"></div>
                    <ConfirmDeleteList onConfirm={deleteList} onClose={() => setConfirmDeleteModal(false)} />
                </>
            )}
            <div className="list-options text">
                { currUserId == creatorId && (
                    <>
                        <Link to={`/cast-lists/${listId}/edit`} className="option">Edit List</Link>
                        <p onClick={() => setConfirmDeleteModal(true)} className="option">Delete List</p>
                        <p onClick={pinList} className="option">{isPinned ? "Unpin List" : "Pin List"}</p>
                    </>
                )}
                { currUserId != creatorId && (
                    <>
                        <p className="red-text option">Block User</p>
                    </>
                )}
                <p className="red-text option">Report List</p>
            </div>
        </>
    )
}

export default ListOptionsModal