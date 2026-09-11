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
    { name: "Tracks" }, { name: "Posts" }, { name: "Comments" }
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
      CommentInput: { type: "object", required: ["body"], properties: { body: { type: "string", maxLength: 1000 } } }
    }
  },
  paths: {
    "/api/health": { get: { tags: ["Health"], summary: "API health", responses: { 200: { description: "API is running" } } } },
    "/api/health/database": { get: { tags: ["Health"], summary: "Database health", responses: { 200: { description: "Database is connected" }, 503: { description: "Database unavailable" } } } },
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
    }
  }
};

export default openApiDocument;
