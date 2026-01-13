import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DisplayRoles from '../components/DisplayRoles'

function PerformerPage() {
    const { slug } = useParams()
    console.log(slug)

    const [ performer, setPerformer] = useState(null)
    const [ roles, setRoles ] = useState([])
    const [ rolesLoading, setRolesLoading ] = useState(null)
    const [ rolesError, setRolesError ] = useState(null)
    const [ roleModalVisible, setRoleModalVisible ] = useState(false)

    useEffect(() => {
        // Fetch the information for this performer
        
        fetch(`http://localhost:3000/performer/by-slug/${slug}`)
        .then(response => response.json())
        .then((data) => {
            setPerformer(data)
        })
        .catch((error) => {
            console.error("Error fetching performer: ", error)
        })
    }, [slug])

    console.log(performer)

    useEffect(() => {
        if (!performer) return
        // Fetch roles for this performer
        setRolesLoading(true)

        fetch(`http://localhost:3000/roles/${performer.id}`)
        .then(response => response.json())
        .then((data) => {
            setRoles(data)
            setRolesLoading(false)
            setRolesError(false)
        })
        .catch((error) => {
            console.error("Error fetching roles: ", error)
            setRolesError(error)
        })
    }, [performer])

    console.log(roles)

    return (
        <main id="centering">
            <div id="perf-main">
                <div id="perf-info">
                    <div id="basic-info">
                        <div id="headshot-div">
                            <p>this is where the headshot goes</p>
                        </div>
                    </div>
                    <div id="perf-basic-info">
                        <p>Most Recent Show: Legally Blonde (Broadway)</p>
                        <p>Hometown: City, State</p>
                        <p>Birthdate: 01-01-1999</p>
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
            </div>
        </main>
    )
}

export default PerformerPage