import { supabase } from '../config/supabaseclient'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ConfirmDeleteList from '../components/ConfirmDeleteList.jsx'

function ListOptionsModal({ currUserId, listId, creatorId, onDownload }) {
    const [ createdDate, setCreatedDate ] = useState(null)
    const [ confirmDeleteModal, setConfirmDeleteModal ] = useState(false)

    useEffect(() => {
        async function fetchCreatedDate() {
            // fetch the creation date for the list
            const { data, error } = await supabase 
                .from("cast_lists")
                .select("created_at")
                .eq("id", listId)
                .single()

            if (!error && data) {
                const createdDate = new Date(data.created_at)
                const formattedDate = createdDate.toLocaleDateString()
                setCreatedDate(formattedDate)
            }
        }

        fetchCreatedDate()
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
                        <Link to={`/cast-lists/${listId}/edit`} className="option">
                            Edit List
                        </Link>
                        <p onClick={() => setConfirmDeleteModal(true)} className="option">
                            Delete List
                        </p>
                    </>
                )}
                <p onClick={onDownload} className="option">
                    Download as Image
                </p>
                <p className="option" id="created-date">
                    Created on {createdDate}
                </p>
            </div>
        </>
    )
}

export default ListOptionsModal