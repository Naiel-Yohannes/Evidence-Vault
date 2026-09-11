import shareServices from '../services/shares'
import { useState, useEffect } from 'react'


const SharedImage = ({ token, fileId, alt }) => {
    const [objectUrl, setObjectUrl] = useState(null)

    useEffect(() => {
        let isCancelled = false
        let objectUrlToRevoke = null

        shareServices.downloadSharedEvidence(token, fileId)
            .then(blob => {
                if (isCancelled) return
                const url = URL.createObjectURL(blob)
                objectUrlToRevoke = url
                setObjectUrl(url)
            })
            .catch(() => { if (!isCancelled) setObjectUrl(null) })

        return () => {
            isCancelled = true
            if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke)
        }
    }, [token, fileId])

    if (!objectUrl) {
        return (
            <div className="flex items-center justify-center bg-muted py-6">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
        )
    }
    return <img src={objectUrl} alt={alt} className="max-h-56 w-full object-contain bg-muted" />
}

export default SharedImage