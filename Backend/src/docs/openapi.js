const jsonBody = (schema, required = true) => ({
  required,
  content: { "application/json": { schema } }
});

const errorResponses = {
  400: { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  401: { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  403: { description: "Role or ownership permission denied", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  404: { description: "Resource not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  409: { description: "Unique-value conflict", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  429: { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
};

const bearer = [{ bearerAuth: [] }];
const listParameters = [
  { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100, default: 25 } },
  { in: "query", name: "offset", schema: { type: "integer", minimum: 0, default: 0 } }
];

const idParameter = (name = "id") => ({
  in: "path", name, required: true, schema: { type: "integer", minimum: 1 }
});

const mutationResponse = {
  description: "Mutation completed",
  content: { "application/json": { schema: { $ref: "#/components/schemas/MutationResult" } } }
};

const catalogCollection = (tag, schemaName, extraParameters = []) => ({
  get: {
    tags: [tag], summary: `List ${tag.toLowerCase()}`,
    parameters: [...listParameters, ...extraParameters],
    responses: { 200: { description: "Paginated results" }, ...errorResponses }
  },
  post: {
    tags: [tag], summary: `Create ${schemaName.toLowerCase()}`, security: bearer,
    requestBody: jsonBody({ $ref: `#/components/schemas/${schemaName}Input` }),
    responses: { 201: mutationResponse, ...errorResponses }
  }
});

const catalogItem = (tag, schemaName) => ({
  get: {
    tags: [tag], summary: `Get ${schemaName.toLowerCase()}`, parameters: [idParameter()],
    responses: { 200: { description: `${schemaName} details` }, ...errorResponses }
  },
  put: {
    tags: [tag], summary: `Update ${schemaName.toLowerCase()}`, security: bearer,
    parameters: [idParameter()], requestBody: jsonBody({ $ref: `#/components/schemas/${schemaName}Input` }),
    responses: { 200: mutationResponse, ...errorResponses }
  },
  delete: {
    tags: [tag], summary: `Delete ${schemaName.toLowerCase()}`, security: bearer,
    parameters: [idParameter()], responses: { 204: { description: "Deleted" }, ...errorResponses }
  }
});

const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "JAM'N API",
    version: "1.0.0",
    description: "REST API for authentication, music catalog management, and social activity. Public reads require no token; protected writes use a Bearer access token. Refresh tokens are rotated in an HttpOnly cookie."
  },
  servers: [{ url: "http://localhost:3001", description: "Local development" }],
  tags: [
    { name: "Health" }, { name: "Authentication" }, { name: "Artists" },
    { name: "Genres" }, { name: "Events" }, { name: "Albums" },
    { name: "Tracks" }, { name: "Posts" }, { name: "Comments" },
    { name: "Follows" }, { name: "Alerts" }, { name: "Playlists" }, { name: "Search" }, { name: "Moderation" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      refreshCookie: { type: "apiKey", in: "cookie", name: "jamn_refresh" }
    },
    schemas: {
      Error: {
        type: "object", required: ["error"],
        properties: { error: { type: "object", required: ["code", "message"], properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string" }, details: { type: "array", items: { type: "string" } }
        } } }
      },
      MutationResult: {
        type: "object",
        properties: { id: { type: "integer" }, updated: { type: "boolean" } }
      },
      User: {
        type: "object", properties: {
          id: { type: "integer" }, username: { type: "string" }, email: { type: "string", format: "email" },
          display_name: { type: "string" }, bio: { type: ["string", "null"] },
          avatar_url: { type: ["string", "null"], format: "uri" },
          role: { type: "string", enum: ["listener", "artist", "admin"] }
        }
      },
      AuthSession: {
        type: "object", required: ["user", "accessToken"],
        properties: { user: { $ref: "#/components/schemas/User" }, accessToken: { type: "string" } }
      },
      RegisterInput: {
        type: "object", required: ["username", "email", "password", "displayName"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 30 },
          email: { type: "string", format: "email", maxLength: 255 },
          password: { type: "string", minLength: 8, maxLength: 72, format: "password" },
          displayName: { type: "string", maxLength: 80 },
          role: { type: "string", enum: ["listener", "artist"], default: "listener" }
        }
      },
      LoginInput: {
        type: "object", required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } }
      },
      ArtistInput: {
        type: "object", properties: {
          userId: { type: ["integer", "null"] }, stageName: { type: "string", maxLength: 100 },
          memberCount: { type: "integer", minimum: 1 }, location: { type: ["string", "null"] },
          bookingEmail: { type: ["string", "null"], format: "email" }, spotifyUrl: { type: ["string", "null"] },
          youtubeUrl: { type: ["string", "null"] }, appleMusicUrl: { type: ["string", "null"] },
          isVerified: { type: "boolean" }
        }
      },
      GenreInput: { type: "object", required: ["name"], properties: { name: { type: "string", maxLength: 80 } } },
      EventInput: {
        type: "object", required: ["name", "location", "startsAt"], properties: {
          name: { type: "string" }, location: { type: "string" }, startsAt: { type: "string", format: "date-time" },
          endsAt: { type: ["string", "null"], format: "date-time" }, priceDescription: { type: ["string", "null"] },
          ticketUrl: { type: ["string", "null"], format: "uri" }
        }
      },
      AlbumInput: {
        type: "object", required: ["artistId", "title"], properties: {
          artistId: { type: "integer" }, title: { type: "string" },
          releaseDate: { type: ["string", "null"], format: "date" }, coverUrl: { type: ["string", "null"], format: "uri" }
        }
      },
      TrackInput: {
        type: "object", required: ["artistId", "title"], properties: {
          artistId: { type: "integer" }, albumId: { type: ["integer", "null"] }, title: { type: "string" },
          audioUrl: { type: ["string", "null"], format: "uri" }, releaseDate: { type: ["string", "null"], format: "date" },
          streamCount: { type: "integer", minimum: 0 }
        }
      },
      PostInput: {
        type: "object", description: "caption, mediaUrl, or both must be supplied", properties: {
          caption: { type: ["string", "null"], maxLength: 1000 }, mediaUrl: { type: ["string", "null"], format: "uri" },
          mediaTypeId: { type: ["integer", "null"] }
        }
      },
      CommentInput: { type: "object", required: ["body"], properties: { body: { type: "string", maxLength: 1000 } } },
      PlaylistInput: { type: "object", properties: {
        name: { type: "string", maxLength: 120 }, description: { type: ["string", "null"], maxLength: 500 }, isPublic: { type: "boolean" }
      } }
    }
  },
  paths: {
    "/api/health": { get: { tags: ["Health"], summary: "API health", responses: { 200: { description: "API is running" } } } },
    "/api/health/database": { get: { tags: ["Health"], summary: "Database health", responses: { 200: { description: "Database is connected" }, 503: { description: "Database unavailable" } } } },
    "/api/health/ready": { get: { tags: ["Health"], summary: "Dependency readiness", responses: { 200: { description: "MySQL and configured Redis are ready" }, 503: { description: "Dependency unavailable" } } } },
    "/api/health/metrics": { get: { tags: ["Health"], summary: "Prometheus metrics", responses: { 200: { description: "Text-format service metrics" } } } },
    "/api/auth/register": { post: {
      tags: ["Authentication"], summary: "Register and start a session",
      requestBody: jsonBody({ $ref: "#/components/schemas/RegisterInput" }),
      responses: { 201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSession" } } } }, ...errorResponses }
    } },
    "/api/auth/login": { post: {
      tags: ["Authentication"], summary: "Log in and start a session",
      requestBody: jsonBody({ $ref: "#/components/schemas/LoginInput" }),
      responses: { 200: { description: "Authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSession" } } } }, ...errorResponses }
    } },
    "/api/auth/refresh": { post: {
      tags: ["Authentication"], summary: "Rotate the refresh cookie", security: [{ refreshCookie: [] }],
      responses: { 200: { description: "New access token and refresh cookie" }, ...errorResponses }
    } },
    "/api/auth/logout": { post: { tags: ["Authentication"], summary: "Revoke the current refresh session", security: [{ refreshCookie: [] }], responses: { 204: { description: "Logged out" } } } },
    "/api/auth/logout-all": { post: { tags: ["Authentication"], summary: "Revoke every refresh session", security: bearer, responses: { 204: { description: "All sessions revoked" }, ...errorResponses } } },
    "/api/auth/me": { get: { tags: ["Authentication"], summary: "Current user", security: bearer, responses: { 200: { description: "Current user" }, ...errorResponses } } },
    "/api/artists": catalogCollection("Artists", "Artist", [
      { in: "query", name: "search", schema: { type: "string" } },
      { in: "query", name: "genre", schema: { type: "string" } }
    ]),
    "/api/artists/{id}": catalogItem("Artists", "Artist"),
    "/api/genres": catalogCollection("Genres", "Genre"),
    "/api/genres/{id}": catalogItem("Genres", "Genre"),
    "/api/events": catalogCollection("Events", "Event", [{ in: "query", name: "upcoming", schema: { type: "boolean" } }]),
    "/api/events/{id}": catalogItem("Events", "Event"),
    "/api/albums": catalogCollection("Albums", "Album", [{ in: "query", name: "artistId", schema: { type: "integer" } }]),
    "/api/albums/{id}": catalogItem("Albums", "Album"),
    "/api/tracks": catalogCollection("Tracks", "Track", [
      { in: "query", name: "artistId", schema: { type: "integer" } },
      { in: "query", name: "albumId", schema: { type: "integer" } }
    ]),
    "/api/tracks/{id}": catalogItem("Tracks", "Track"),
    "/api/posts": {
      get: { tags: ["Posts"], summary: "List feed posts", parameters: [...listParameters, { in: "query", name: "userId", schema: { type: "integer" } }], responses: { 200: { description: "Paginated posts" }, ...errorResponses } },
      post: { tags: ["Posts"], summary: "Create a post", security: bearer, requestBody: jsonBody({ $ref: "#/components/schemas/PostInput" }), responses: { 201: mutationResponse, ...errorResponses } }
    },
    "/api/posts/{id}": catalogItem("Posts", "Post"),
    "/api/posts/{postId}/like": {
      put: { tags: ["Posts"], summary: "Like a post (idempotent)", security: bearer, parameters: [idParameter("postId")], responses: { 204: { description: "Liked" }, ...errorResponses } },
      delete: { tags: ["Posts"], summary: "Remove own like", security: bearer, parameters: [idParameter("postId")], responses: { 204: { description: "Like removed" }, ...errorResponses } }
    },
    "/api/posts/{postId}/comments": {
      get: { tags: ["Comments"], summary: "List post comments", parameters: [idParameter("postId"), ...listParameters], responses: { 200: { description: "Paginated comments" }, ...errorResponses } },
      post: { tags: ["Comments"], summary: "Create a comment", security: bearer, parameters: [idParameter("postId")], requestBody: jsonBody({ $ref: "#/components/schemas/CommentInput" }), responses: { 201: mutationResponse, ...errorResponses } }
    },
    "/api/comments/{id}": {
      put: { tags: ["Comments"], summary: "Update own comment", security: bearer, parameters: [idParameter()], requestBody: jsonBody({ $ref: "#/components/schemas/CommentInput" }), responses: { 200: mutationResponse, ...errorResponses } },
      delete: { tags: ["Comments"], summary: "Delete own comment", security: bearer, parameters: [idParameter()], responses: { 204: { description: "Deleted" }, ...errorResponses } }
    },
    "/api/alerts": { get: {
      tags: ["Alerts"], summary: "List the current user's alert inbox", security: bearer,
      parameters: [...listParameters,
        { in: "query", name: "unread", schema: { type: "boolean" } },
        { in: "query", name: "type", schema: { type: "string", enum: ["post_like", "post_comment", "new_follower", "artist_release", "event_reminder", "system"] } }
      ], responses: { 200: { description: "Paginated alerts, newest first" }, ...errorResponses }
    } },
    "/api/alerts/unread-count": { get: {
      tags: ["Alerts"], summary: "Get the unread badge count", security: bearer,
      responses: { 200: { description: "Unread count" }, ...errorResponses }
    } },
    "/api/alerts/read-all": { put: {
      tags: ["Alerts"], summary: "Mark all alerts as read", security: bearer,
      responses: { 200: { description: "Number of alerts updated" }, ...errorResponses }
    } },
    "/api/alerts/{id}/read": { put: {
      tags: ["Alerts"], summary: "Mark one alert as read", security: bearer,
      parameters: [idParameter()], responses: { 200: { description: "Alert marked read" }, ...errorResponses }
    } },
    "/api/alerts/{id}": { delete: {
      tags: ["Alerts"], summary: "Delete one alert", security: bearer,
      parameters: [idParameter()], responses: { 204: { description: "Alert deleted" }, ...errorResponses }
    } },
    "/api/alert-preferences": { get: {
      tags: ["Alerts"], summary: "List alert preferences", security: bearer,
      responses: { 200: { description: "All supported alert types and their enabled state" }, ...errorResponses }
    } },
    "/api/alert-preferences/{type}": { put: {
      tags: ["Alerts"], summary: "Enable or disable an alert category", security: bearer,
      parameters: [{ in: "path", name: "type", required: true, schema: { type: "string", enum: ["post_like", "post_comment", "new_follower", "artist_release", "event_reminder", "system"] } }],
      requestBody: jsonBody({ type: "object", required: ["inAppEnabled"], properties: { inAppEnabled: { type: "boolean" } } }),
      responses: { 200: { description: "Preference updated" }, ...errorResponses }
    } },
    "/api/users/{userId}/follow": {
      put: { tags: ["Follows"], summary: "Follow a user", security: bearer, parameters: [idParameter("userId")], responses: { 204: { description: "Following" }, ...errorResponses } },
      delete: { tags: ["Follows"], summary: "Unfollow a user", security: bearer, parameters: [idParameter("userId")], responses: { 204: { description: "Unfollowed" }, ...errorResponses } }
    },
    "/api/users/{userId}/followers": { get: { tags: ["Follows"], summary: "List a user's followers", parameters: [idParameter("userId"), ...listParameters], responses: { 200: { description: "Paginated followers" }, ...errorResponses } } },
    "/api/users/{userId}/following": { get: { tags: ["Follows"], summary: "List users followed by a user", parameters: [idParameter("userId"), ...listParameters], responses: { 200: { description: "Paginated following" }, ...errorResponses } } },
    "/api/users/{userId}/follow-stats": { get: { tags: ["Follows"], summary: "Get user follow counts", parameters: [idParameter("userId")], responses: { 200: { description: "Follower and following counts" }, ...errorResponses } } },
    "/api/artists/{artistId}/follow": {
      put: { tags: ["Follows"], summary: "Follow an artist", security: bearer, parameters: [idParameter("artistId")], responses: { 204: { description: "Following" }, ...errorResponses } },
      delete: { tags: ["Follows"], summary: "Unfollow an artist", security: bearer, parameters: [idParameter("artistId")], responses: { 204: { description: "Unfollowed" }, ...errorResponses } }
    },
    "/api/artists/{artistId}/followers": { get: { tags: ["Follows"], summary: "List an artist's followers", parameters: [idParameter("artistId"), ...listParameters], responses: { 200: { description: "Paginated followers" }, ...errorResponses } } },
    "/api/artists/{artistId}/follow-stats": { get: { tags: ["Follows"], summary: "Get artist follower count", parameters: [idParameter("artistId")], responses: { 200: { description: "Follower count" }, ...errorResponses } } },
    "/api/follows": { get: { tags: ["Follows"], summary: "List my followed users and artists", security: bearer, responses: { 200: { description: "Followed users and artists" }, ...errorResponses } } },
    "/api/playlists": {
      get: { tags: ["Playlists"], summary: "List public playlists", parameters: listParameters, responses: { 200: { description: "Paginated playlists" }, ...errorResponses } },
      post: { tags: ["Playlists"], summary: "Create a playlist", security: bearer, requestBody: jsonBody({ $ref: "#/components/schemas/PlaylistInput" }), responses: { 201: mutationResponse, ...errorResponses } }
    },
    "/api/playlists/mine": { get: { tags: ["Playlists"], summary: "List my playlists", security: bearer, parameters: listParameters, responses: { 200: { description: "Own playlists" }, ...errorResponses } } },
    "/api/playlists/{id}": {
      get: { tags: ["Playlists"], summary: "Get a visible playlist and its ordered tracks", parameters: [idParameter()], responses: { 200: { description: "Playlist details" }, ...errorResponses } },
      put: { tags: ["Playlists"], summary: "Update own playlist", security: bearer, parameters: [idParameter()], requestBody: jsonBody({ $ref: "#/components/schemas/PlaylistInput" }), responses: { 200: mutationResponse, ...errorResponses } },
      delete: { tags: ["Playlists"], summary: "Delete own playlist", security: bearer, parameters: [idParameter()], responses: { 204: { description: "Deleted" }, ...errorResponses } }
    },
    "/api/playlists/{id}/tracks": { post: { tags: ["Playlists"], summary: "Add a track idempotently", security: bearer, parameters: [idParameter()], requestBody: jsonBody({ type: "object", required: ["trackId"], properties: { trackId: { type: "integer" } } }), responses: { 201: mutationResponse, ...errorResponses } } },
    "/api/playlists/{id}/tracks/{trackId}": { delete: { tags: ["Playlists"], summary: "Remove a track", security: bearer, parameters: [idParameter(), idParameter("trackId")], responses: { 204: { description: "Removed" }, ...errorResponses } } },
    "/api/playlists/{id}/tracks/order": { put: { tags: ["Playlists"], summary: "Replace the complete track order", security: bearer, parameters: [idParameter()], requestBody: jsonBody({ type: "object", required: ["trackIds"], properties: { trackIds: { type: "array", uniqueItems: true, items: { type: "integer" } } } }), responses: { 200: mutationResponse, ...errorResponses } } },
    "/api/search": { get: { tags: ["Search"], summary: "Search across the platform", parameters: [
      { in: "query", name: "q", required: true, schema: { type: "string", minLength: 2, maxLength: 100 } },
      { in: "query", name: "types", schema: { type: "string", example: "artists,tracks" } },
      { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 25, default: 10 } }
    ], responses: { 200: { description: "Results grouped by requested resource type" }, ...errorResponses } } },
    "/api/reports": { post: { tags: ["Moderation"], summary: "Report content or an account", security: bearer, responses: { 201: mutationResponse, ...errorResponses } } },
    "/api/admin/reports": { get: { tags: ["Moderation"], summary: "List moderation reports", security: bearer, parameters: listParameters, responses: { 200: { description: "Moderation queue" }, ...errorResponses } } },
    "/api/admin/reports/{id}": { put: { tags: ["Moderation"], summary: "Review a report", security: bearer, parameters: [idParameter()], responses: { 200: mutationResponse, ...errorResponses } } },
    "/api/admin/artists/{id}/verification": { put: { tags: ["Moderation"], summary: "Set artist verification", security: bearer, parameters: [idParameter()], responses: { 200: mutationResponse, ...errorResponses } } },
    "/api/admin/users/{id}/status": { put: { tags: ["Moderation"], summary: "Suspend or restore a user", security: bearer, parameters: [idParameter()], responses: { 200: mutationResponse, ...errorResponses } } },
    "/api/admin/content/{type}/{id}": { delete: { tags: ["Moderation"], summary: "Remove a post or comment", security: bearer, parameters: [{ in: "path", name: "type", required: true, schema: { type: "string", enum: ["post", "comment"] } }, idParameter()], responses: { 204: { description: "Removed" }, ...errorResponses } } },
    "/api/admin/audit-logs": { get: { tags: ["Moderation"], summary: "List admin audit history", security: bearer, parameters: listParameters, responses: { 200: { description: "Audit records" }, ...errorResponses } } }
  }
};

export default openApiDocument;
