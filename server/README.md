# IntellMeet Backend

## Environment setup

Copy `.env.example` to `.env` and provide local values.

### Cloudinary

Create a Cloudinary account/project and add these values to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Never commit the real `CLOUDINARY_API_SECRET`.

The backend exposes an authenticated signed-upload endpoint:

```http
POST /api/media/signature
Authorization: Bearer <access-token>
Content-Type: application/json
```

Request body:

```json
{
  "purpose": "avatar"
}
```

Supported purposes:

- `avatar` -> Cloudinary image upload under `intellmeet/avatars`
- `recording` -> Cloudinary video upload under `intellmeet/recordings`

The response contains a short-lived signature, timestamp, Cloudinary cloud name, public API key, folder, public ID, resource type, and upload URL. The frontend uploads the media directly to Cloudinary using those signed fields.

The API secret stays only on the backend and is never sent to the browser.
