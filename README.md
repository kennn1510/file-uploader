# file-uploader

A simple cloud storage service inspired by Google Drive, allowing users to upload and organize files securely.

## Features

- **User Authentication**: Secure session-based authentication with Passport.js.
- **File Uploads**: Users can upload files, initially stored in the filesystem via Multer.
- **Folder Management**: CRUD operations for folders to organize files.
- **File Details & Downloads**: View file metadata and download files.
- **Cloud Storage Integration**: Files are stored in Cloudinary or Supabase with URLs saved in the database.
- **Folder Sharing**: Users can generate shareable links with expiration settings.

## Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM
- **Authentication**: Passport.js with Prisma session store
- **File Handling**: Multer middleware
- **Database**: PostgreSQL
- **Cloud Storage**: Cloudinary or Supabase (tbd)

## Installation

```bash
git clone https://github.com/your-username/file-uploader.git
cd file-uploader
npm install
```

## Useful Commands

```commands
npx prisma generate
npx prisma migrate dev
npm start
```

## Don't forget to create your own .env file (and make sure it is in your .gitignore)

- DATABASE_URL=""
- PORT=""
