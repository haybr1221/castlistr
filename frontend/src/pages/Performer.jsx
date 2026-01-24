import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCurrentUser } from '../config/currentUser.js'
import { supabase } from '../config/supabaseclient.js'
import DisplayRoles from '../components/DisplayRoles'
import UploadHeadshot from '../components/UploadHeadshot'
import AddRoleModal from '../components/AddRoleModal'

function PerformerPage() {
    const { slug } = useParams()

    const [ performer, setPerformer] = useState({})
    const [ roles, setRoles ] = useState([])
    const [ rolesLoading, setRolesLoading ] = useState(null)
    const [ rolesError, setRolesError ] = useState(null)
    const [ roleModalVisible, setRoleModalVisible ] = useState(false)
    const [headshotLoading, setHeadshotLoading] = useState(true)

    const { user } = useCurrentUser()

    useEffect(() => {
        // Fetch the information for this performer
        setHeadshotLoading(true)
        
        fetch(`http://localhost:3000/performer/by-slug/${slug}`)
        .then(response => response.json())
        .then((data) => {
            setPerformer(data)
            setHeadshotLoading(false)
        })
        .catch((error) => {
            console.error("Error fetching performer: ", error)
        })
    }, [slug])
    
    async function handleCreate(roleInfo, isMultiple) {
        // Insert into performer_has_char

        const { data, error } = await supabase
            .from("performer_has_character")
            .insert({
                performer_id: performer.id,
                char_id: roleInfo.charId,
                tour_id: roleInfo.tourId,
                cover_status: roleInfo.cover_status,
                arrived: roleInfo.arrivedDate,
                left: roleInfo.leftDate,
                user_id: user.id
            })
            .select()

        if (error) throw error

        // data.id is the new role ID 
        const newRoleId = data.id 
        
        const fullRole = await fetch(`http://localhost:3000/roles/single/${newRoleId}`).then(res => res.json())
        
        setRoles(prev => [...prev, fullRole])

        if (!isMultiple) {
            setRoleModalVisible(false)
            return
        }
    }

    useEffect(() => {
        if (!performer) return
        // Fetch roles for this performer
        setRolesLoading(true)

        fetch(`http://localhost:3000/roles/${performer.id}`)
        .then(response => response.json())
        .then((data) => {
            if (!data) throw "No data to fetch!"
            setRoles(data)
            setRolesLoading(false)
            setRolesError(false)
        })
        .catch((error) => {
            console.error("Error fetching roles: ", error)
            setRolesError(error)
        })
    }, [performer])


    async function handleUpload(newUrl) {
        console.log(newUrl)
        setPerformer(prev => ({ 
            ...prev, 
            headshot_url: newUrl })
        )
    }

    return (
        <main id="centering">
            <div id="perf-main">
                <div id="perf-info">
                    <div id="basic-info">
                            <div id="headshot-div">
                            { headshotLoading && (
                                <p className="text">Loading...</p>
                            )}
                            { performer.headshot_url && (
                                <img src={performer.headshot_url} alt={`Headshot for ${performer.full_name}`}/>
                            )}
                            { !performer.headshot_url && !headshotLoading && (
                                <UploadHeadshot perfId={performer.id} onUploaded={handleUpload} />
                            )}
                        </div>
                    </div>
                    <div id="perf-basic-info">
                        <p className="perf-name">{performer.full_name}</p>
                        <p>Most Recent Show: Legally Blonde (Broadway)</p>
                        <p>Used in 0 cast lists</p>
                    </div>
                </div>
                <div id="interesting-info">
                    <div className="info-tab">
                        <button onClick={() => setRoleModalVisible(true)}>Add Role</button>
                        {/* Display actor's previous roles */}
                        {rolesLoading && <p>Loading...</p>}
                        {rolesError && (<p>Error loading: {roles.messages}</p>)}
                        <DisplayRoles rolesList={roles}/>
                    </div>
                </div>
                
                {roleModalVisible && (
                    <>
                        <div id="overlay"></div>
                        <AddRoleModal onClose={() => setRoleModalVisible(false)} onCreate={handleCreate}/>
                    </>
                )}
            </div>
        </main>
    )
}

export default PerformerPage