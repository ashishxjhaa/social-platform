# Backend API

> **Production-style REST API** built with **Node.js, Express,
> TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, Cloudinary,
> and Multer**.

## Overview

This project is a modular backend for a video-sharing/social platform.
It provides secure authentication, media uploads, user profile
management, subscriptions, tweets, comments, likes, and video
management.

## Features

-   JWT Authentication (Access + Refresh Tokens)
-   Secure HTTP-only Cookies
-   User Registration/Login
-   Avatar & Cover Image Uploads (Cloudinary)
-   Video Upload & Management
-   Tweets CRUD
-   Comments CRUD
-   Like/Unlike Videos, Tweets, and Comments
-   Channel Subscriptions
-   Watch History
-   Prisma ORM + PostgreSQL
-   Zod Validation
-   Bcrypt Password Hashing

## Tech Stack

-   Node.js
-   Express.js
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   JWT
-   Cloudinary
-   Multer
-   Zod
-   bcrypt

## Project Structure

``` text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── index.ts
└── .env.example
```

## Database Models

-   User
-   Video
-   Subscription
-   Tweet
-   Comment
-   Like


## Authentication

Protected endpoints require:

Authorization: Bearer `<access_token>`{=html}

or the access token stored in an HTTP-only cookie.

Refresh tokens are stored securely and used to issue new access tokens.

## API Reference

### Users

  Method       Endpoint           
  --------    ------------------------------     
  POST        /api/v1/users/register               

  POST       /api/v1/users/login                     

  POST       /api/v1/users/logout                    

  POST       /api/v1/users/refresh-token              

  GET        /api/v1/users/me                         

  PATCH      /api/v1/users/me                        

  PATCH      /api/v1/users/me/password                 

  PATCH      /api/v1/users/me/avatar                  

  PATCH      /api/v1/users/me/cover-image             

  GET        /api/v1/users/c/:username                 

  GET       /api/v1/users/history                     


### Videos

  Method   Endpoint
  -------- ----------------------------------------
  GET      /api/v1/videos
  
  POST     /api/v1/videos

  GET      /api/v1/videos/:videoId

  PATCH    /api/v1/videos/:videoId

  DELETE   /api/v1/videos/:videoId

  PATCH    /api/v1/videos/toggle/publish/:videoId

### Tweets

  Method   Endpoint
  -------- -----------------------------
  POST     /api/v1/tweets
  
  GET      /api/v1/tweets/user/:userId
  
  PATCH    /api/v1/tweets/:tweetId
  
  DELETE   /api/v1/tweets/:tweetId

### Subscriptions

  Method   Endpoint
  -------- ---------------------------------------
  POST     /api/v1/subscriptions/c/:channelId
  
  GET      /api/v1/subscriptions/c/:channelId
  
  GET      /api/v1/subscriptions/u/:subscriberId

### Comments

  Method   Endpoint
  -------- -------------------------------
  GET      /api/v1/comments/:videoId
  
  POST     /api/v1/comments/:videoId
  
  PATCH    /api/v1/comments/c/:commentId
  
  DELETE   /api/v1/comments/c/:commentId

### Likes

  Method   Endpoint
  -------- -----------------------------------
  POST     /api/v1/likes/toggle/v/:videoId
  
  POST     /api/v1/likes/toggle/t/:tweetId
  
  POST     /api/v1/likes/toggle/c/:commentId
  
  GET      /api/v1/likes/videos

## Environment Variables

See `.env.example`.

Required:

-   PORT
-   DATABASE_URL
-   CORS_ORIGIN
-   ACCESS_TOKEN_SECRET
-   ACCESS_TOKEN_EXPIRY
-   REFRESH_TOKEN_SECRET
-   REFRESH_TOKEN_EXPIRY
-   CLOUDINARY_CLOUD_NAME
-   CLOUDINARY_API_KEY
-   CLOUDINARY_API_SECRET
-   SALT_ROUNDS

## Installation

``` bash
bun install
```

## Run Migrations

``` bash
bunx prisma migrate dev
```

## Generate Prisma Client

``` bash
bunx prisma generate
```

## Start Development Server

``` bash
bun run dev
```
