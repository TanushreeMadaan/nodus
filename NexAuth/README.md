## Pooling
 - A Pool object from the pg moduleis created, holding multiple, reusable database connections.
 - Whenever the application needs to execute a query, it borrows a connection from the pool. After the query, the connection is returned to the pool for future use.
 - Minimizes overhead increases performance.

{ **Bcrypt** - Hashes passwords ; Usage - bcrypt.hash(password, hash_rounds) }

## JWT
 - It consists of three parts: header, payload, and signature.
 - The header typically alg and typ, indicating the algorithm used and the type of token.
 - The payload holds the statements about the user (e.g., user ID, role, expiration time).
 - The signature is used to verify the token's integrity.
 - JWTs are signed using a secret key, and the receiver can verify the signature using the same key.
 - JWTs are stateless, meaning the server doesn't need to store session data.
 - They are commonly used for authentication and authorization in web applications.

## Logout w token

 - tokens stored client side and expire after a certain period.
 - user shouldnt have to login again after token refresh
 - allow logout by invalidating refresh token

