# Security Specification for LoopTube

## 1. Data Invariants
- Each user only has access to their own `/users/{userId}` document and subcollections (`/users/{userId}/playlists/{playlistId}` and `/users/{userId}/playlists/{playlistId}/items/{itemId}`).
- No unauthenticated reads or writes are allowed.
- Path variable `{userId}` must match `request.auth.uid`.
- Video IDs must match `^[a-zA-Z0-9_-]+$` and max length 32 characters.
- String boundaries and required keys are enforced on all creates and updates.
- No user can modify other users' playlist records or user profiles.

## 2. The Dirty Dozen Payloads
1. Unauthenticated read of `/users/{anyId}` -> DENIED
2. Unauthenticated write to `/users/{anyId}` -> DENIED
3. Authenticated user A trying to read `/users/userB` -> DENIED
4. Authenticated user A trying to write to `/users/userB/playlists/pl1` -> DENIED
5. Authenticated user trying to inject 10MB string into playlist name -> DENIED
6. Authenticated user injecting malicious videoId with special chars (`<script>`) -> DENIED
7. Authenticated user trying to create a playlist item with mismatched userId field -> DENIED
8. Unauthenticated query to list playlists -> DENIED
9. Authenticated user trying to update immutable `userId` on playlist -> DENIED
10. Unauthenticated deletion of playlist item -> DENIED
11. Authenticated user B attempting to delete user A's playlist item -> DENIED
12. Blanket list queries bypassing owner path check -> DENIED
