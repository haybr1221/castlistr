import { useState, useRef } from 'react'
import { supabase } from '../config/supabaseclient.js'

function UploadPoster({ showId, onUploaded}) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [isUploading, setIsUploading] = useState()
    const [error, setError] = useState()
    const imageInputRef = useRef(null)

    function generateRandomName(original) {
        const extension = original.name.split('.').pop(); // get file extension
        const randomString = Math.random().toString(36).substring(2, 10); // generate random title
        return `poster_${randomString}.${extension}`
    }

    function handleImageChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
        setError(null)
    }

    async function handlePosterUpload() {
        if (!selectedFile) {
            setError(error)
            return
        }

        setIsUploading(true)
        setError(null)

        const newFileName = generateRandomName(selectedFile)

        try {
            // Add the poster to the bucket
            const { error: uploadError } = await supabase
                .storage
                .from("posters")
                .upload(`${newFileName}`, selectedFile)

            if (uploadError) throw uploadError

            // Fetch the URL for the newly added poster
            const { data: urlData, error: urlError } = supabase
                .storage
                .from("posters")
                .getPublicUrl(newFileName)
            
            if (urlError) throw urlError

            const url = urlData.publicUrl

            // Add the URL to the public table
            const { error: addUrlError } = await supabase
                .from("show")
                .update({"poster_url": url})
                .eq("id", showId)

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
            <input type="file" hidden ref={imageInputRef} onChange={handleImageChange}/>

            {!selectedFile && (
                <button onClick={() => imageInputRef.current?.click()} className="button">Select Image</button>
            )}
            {selectedFile && (
                <button onClick={handlePosterUpload} className="button">Upload Image</button>
            )}
            {isUploading && (
                <p className="text">Uploading...</p>
            )}
        </div>
    )
}

export default UploadPoster