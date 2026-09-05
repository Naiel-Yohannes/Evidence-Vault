# Security

## Assets being protected

User account information and credentials, vulnerability findings, evidence files, and the authorization rules controlling who can upload or download them.

## Attacker model

This app defends against authenticated users attempting to access, modify, or delete data belonging to other users, and against unauthenticated users attempting to reach protected routes without a valid session. It does not defend against an attacker with direct access to the server or database.

## Trust boundaries

Any data sent by the client (request body, URL parameters, uploaded files) is untrusted until validated. Frontend checks exist only to improve the user experience and can be bypassed entirely by sending requests directly to the API — the backend is the only real security boundary, and every check that matters is enforced there.

## Authorization rules

Users can only view, edit, upload to, or delete data that belongs to them. This is enforced at the database query level — every query includes the authenticated user's ID as part of the WHERE clause, rather than checking ownership after the data has already been fetched.

## Allowed upload types and limits

Uploads are restricted to a small allowlist of file types, verified by checking the file's actual content rather than its extension or claimed type. Each upload is limited to 5MB to prevent denial-of-service through oversized files.

## Known limitations

Uploaded files are stored on local server disk rather than backed-up cloud storage, so a disk failure would result in permanent loss of evidence files. Authentication tokens (JWTs) are stored in localStorage rather than an httpOnly cookie, which means they could be stolen if an attacker ever achieved script execution in the app via XSS.