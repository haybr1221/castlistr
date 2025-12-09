import { useState, useRef } from 'react'
import { supabase } from '../config/supabaseclient.js'
import { useCurrentUser } from '../config/currentUser.js'

function UploadAvatar({ onUploaded }) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [isUploading, setIsUploading] = useState()
    const [error, setError] = useState()
    const imageInputRef = useRef(null)

    const { user } = useCurrentUser()

    function generateRandomName(original) {
        const extension = original.name.split('.').pop(); // get file extension
        const randomString = Math.random().toString(36).substring(2, 10); // 8-char random string
        return `avatar_${randomString}.${extension}`
    }

    function handleImageChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
        setError(null)
    }

    async function handlePosterUpload() {
        if (!selectedFile) {
            setError("Please select an image.")
            return
        }

        setIsUploading(true)
        setError(null)

        const newFileName = generateRandomName(selectedFile)

        try {
            // Add the avatar to the bucket
            const { error: uploadError } = await supabase
                .storage
                .from("avatars")
                .upload(`${newFileName}`, selectedFile)

            if (uploadError) throw uploadError

            // Fetch the URL for this avatar
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from("avatars")
                .getPublicUrl(newFileName)

            if (urlError) throw urlError

            const url = urlData.publicUrl

            // Add the URL to the public table
            const { error: addUrlError } = await supabase
                .from("profile")
                .update({"avatar_url": url})
                .eq("id", user.id)

            if (addUrlError) throw addUrlError

            onUploaded(url)
        }
        catch(error) {
            setError(error)
            setIsUploading(false)
        }
        finally {
            setIsUploading(false)
        }
    }

    return (
        <div id="add-poster">
            <input
                type="file"
                hidden
                ref={imageInputRef}
                onChange={handleImageChange}
            />

            {!selectedFile && (
                <button onClick={() => imageInputRef.current?.click()}>Select Image</button>
            )}
            {selectedFile && (
                <button onClick={handlePosterUpload}>Upload Image</button>
            )}
            {isUploading && (
                <p className="text">Uploading...</p>
            )}
        </div>
    )
}

export default UploadAvatar