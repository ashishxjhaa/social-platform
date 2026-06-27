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

   
  # API Reference
  
  This document describes all available REST API endpoints exposed by the backend.
  
  ## Base URL
  
  ```text
  http://localhost:8000/api/v1
  ```
  
  ## Authentication
  
  Protected endpoints require a valid **JWT Access Token**.
  
  The token can be supplied either:
  
  * As an **HTTP-only cookie** (`accessToken`)
  * Via the `Authorization` header
  
  ```http
  Authorization: Bearer <access_token>
  ```
  
  ---
  
  # Users
  
  ---
  
  ## Register User
  
  Creates a new user account.
  
  | Property           | Value                 |
  | ------------------ | --------------------- |
  | **Method**         | `POST`                |
  | **Endpoint**       | `/users/register`     |
  | **Authentication** | Public                |
  | **Content-Type**   | `multipart/form-data` |
  
  ### Request Body
  
  | Field      | Type   | Required |
  | ---------- | ------ | :------: |
  | username   | string |     ✅    |
  | email      | string |     ✅    |
  | fullName   | string |     ✅    |
  | password   | string |     ✅    |
  | avatar     | file   |     ✅    |
  | coverImage | file   |     ❌    |
  
  ### Responses
  
  |  Status | Meaning                                      |
  | :-----: | -------------------------------------------- |
  | **201** | User registered successfully                 |
  | **400** | Validation failed or required fields missing |
  | **409** | Username or email already exists             |
  | **500** | Internal server error                        |
  
  ---
  
  ## Login
  
  Authenticates a user and returns a new access token and refresh token.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `POST`             |
  | **Endpoint**       | `/users/login`     |
  | **Authentication** | Public             |
  | **Content-Type**   | `application/json` |
  
  ### Request Body
  
  | Field    | Type   |  Required |
  | -------- | ------ | :-------: |
  | username | string | Optional* |
  | email    | string | Optional* |
  | password | string |     ✅     |
  
  > **Note:** Either `username` or `email` must be provided.
  
  ### Responses
  
  |  Status | Meaning                   |
  | :-----: | ------------------------- |
  | **200** | Authentication successful |
  | **400** | Invalid request payload   |
  | **401** | Invalid credentials       |
  | **500** | Internal server error     |
  
  ---
  
  ## Logout
  
  Invalidates the current refresh token and clears authentication cookies.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `POST`             |
  | **Endpoint**       | `/users/logout`    |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Responses
  
  |  Status | Meaning                      |
  | :-----: | ---------------------------- |
  | **200** | User logged out successfully |
  | **401** | Unauthorized request         |
  | **500** | Internal server error        |
  
  ---
  
  ## Refresh Access Token
  
  Issues a new access token using a valid refresh token.
  
  | Property           | Value                                   |
  | ------------------ | --------------------------------------- |
  | **Method**         | `POST`                                  |
  | **Endpoint**       | `/users/refresh-token`                  |
  | **Authentication** | Public *(requires valid refresh token)* |
  | **Content-Type**   | `application/json`                      |
  
  ### Request Body
  
  | Field        | Type   |  Required |
  | ------------ | ------ | :-------: |
  | refreshToken | string | Optional* |
  
  > **Note:** The refresh token may also be supplied through an HTTP-only cookie.
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Access token refreshed successfully |
  | **401** | Invalid or expired refresh token    |
  | **500** | Internal server error               |
  
  ---
  
  ## Get Current User
  
  Returns the authenticated user's profile.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `GET`              |
  | **Endpoint**       | `/users/me`        |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | User profile retrieved successfully |
  | **401** | Unauthorized request                |
  | **500** | Internal server error               |
  
  ---
  
  ## Update Account Details
  
  Updates the authenticated user's profile information.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `PATCH`            |
  | **Endpoint**       | `/users/me`        |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Request Body
  
  | Field    | Type   | Required |
  | -------- | ------ | :------: |
  | fullName | string |     ✅    |
  | email    | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                      |
  | :-----: | ---------------------------- |
  | **200** | Account updated successfully |
  | **400** | Required fields missing      |
  | **401** | Unauthorized request         |
  | **409** | Email already exists         |
  | **500** | Internal server error        |
  
  ---
  
  ## Change Password
  
  Updates the authenticated user's password.
  
  | Property           | Value                |
  | ------------------ | -------------------- |
  | **Method**         | `PATCH`              |
  | **Endpoint**       | `/users/me/password` |
  | **Authentication** | Required             |
  | **Content-Type**   | `application/json`   |
  
  ### Request Body
  
  | Field       | Type   | Required |
  | ----------- | ------ | :------: |
  | oldPassword | string |     ✅    |
  | newPassword | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                                       |
  | :-----: | --------------------------------------------- |
  | **200** | Password updated successfully                 |
  | **400** | Invalid request or incorrect current password |
  | **401** | Unauthorized request                          |
  | **404** | User not found                                |
  | **500** | Internal server error                         |
  
  ---
  
  ## Update Avatar
  
  Uploads a new avatar image for the authenticated user.
  
  | Property           | Value                 |
  | ------------------ | --------------------- |
  | **Method**         | `PATCH`               |
  | **Endpoint**       | `/users/me/avatar`    |
  | **Authentication** | Required              |
  | **Content-Type**   | `multipart/form-data` |
  
  ### Request Body
  
  | Field  | Type | Required |
  | ------ | ---- | :------: |
  | avatar | file |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                              |
  | :-----: | ------------------------------------ |
  | **200** | Avatar updated successfully          |
  | **400** | Avatar file missing or upload failed |
  | **401** | Unauthorized request                 |
  | **500** | Internal server error                |
  
  ---
  
  ## Update Cover Image
  
  Uploads a new cover image for the authenticated user.
  
  | Property           | Value                   |
  | ------------------ | ----------------------- |
  | **Method**         | `PATCH`                 |
  | **Endpoint**       | `/users/me/cover-image` |
  | **Authentication** | Required                |
  | **Content-Type**   | `multipart/form-data`   |
  
  ### Request Body
  
  | Field      | Type | Required |
  | ---------- | ---- | :------: |
  | coverImage | file |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                              |
  | :-----: | ------------------------------------ |
  | **200** | Cover image updated successfully     |
  | **400** | Cover image missing or upload failed |
  | **401** | Unauthorized request                 |
  | **500** | Internal server error                |
  
  ---
  
  ## Get Channel Profile
  
  Returns the public profile of a user by username.
  
  | Property           | Value                |
  | ------------------ | -------------------- |
  | **Method**         | `GET`                |
  | **Endpoint**       | `/users/c/:username` |
  | **Authentication** | Required             |
  | **Content-Type**   | `application/json`   |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | username  | string |
  
  ### Responses
  
  |  Status | Meaning                                |
  | :-----: | -------------------------------------- |
  | **200** | Channel profile retrieved successfully |
  | **400** | Username is required                   |
  | **401** | Unauthorized request                   |
  | **404** | Channel not found                      |
  | **500** | Internal server error                  |
  
  ---
  
  ## Get Watch History
  
  Returns the authenticated user's watch history.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `GET`              |
  | **Endpoint**       | `/users/history`   |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Responses
  
  |  Status | Meaning                              |
  | :-----: | ------------------------------------ |
  | **200** | Watch history retrieved successfully |
  | **401** | Unauthorized request                 |
  | **500** | Internal server error                |
  
  ---


  -------- ----------------------------------------
  # Videos
  
  ---
  
  ## Publish Video
  
  Uploads a new video along with its thumbnail.
  
  | Property           | Value                 |
  | ------------------ | --------------------- |
  | **Method**         | `POST`                |
  | **Endpoint**       | `/videos`             |
  | **Authentication** | Required              |
  | **Content-Type**   | `multipart/form-data` |
  
  ### Request Body
  
  | Field       | Type   | Required |
  | ----------- | ------ | :------: |
  | title       | string |     ✅    |
  | description | string |     ✅    |
  | videoFile   | file   |     ✅    |
  | thumbnail   | file   |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                                         |
  | :-----: | ----------------------------------------------- |
  | **201** | Video published successfully                    |
  | **400** | Required fields or files missing                |
  | **401** | Unauthorized request                            |
  | **500** | Failed to upload media or internal server error |
  
  ---
  
  ## Get All Videos
  
  Returns a paginated list of published videos.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `GET`              |
  | **Endpoint**       | `/videos`          |
  | **Authentication** | Public             |
  | **Content-Type**   | `application/json` |
  
  ### Query Parameters
  
  | Parameter | Type   | Required | Description                |
  | --------- | ------ | :------: | -------------------------- |
  | page      | number |     ❌    | Page number                |
  | limit     | number |     ❌    | Number of records per page |
  | query     | string |     ❌    | Search by title            |
  | sortBy    | string |     ❌    | Field used for sorting     |
  | sortType  | string |     ❌    | `asc` or `desc`            |
  | userId    | string |     ❌    | Filter videos by owner     |
  
  ### Responses
  
  |  Status | Meaning                       |
  | :-----: | ----------------------------- |
  | **200** | Videos retrieved successfully |
  | **500** | Internal server error         |
  
  ---
  
  ## Get Video
  
  Returns details of a single video.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `GET`              |
  | **Endpoint**       | `/videos/:videoId` |
  | **Authentication** | Public             |
  | **Content-Type**   | `application/json` |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Responses
  
  |  Status | Meaning                      |
  | :-----: | ---------------------------- |
  | **200** | Video retrieved successfully |
  | **404** | Video not found              |
  | **500** | Internal server error        |
  
  ---
  
  ## Update Video
  
  Updates an existing video's metadata and optionally replaces its thumbnail.
  
  | Property           | Value                   |
  | ------------------ | ----------------------- |
  | **Method**         | `PATCH`                 |
  | **Endpoint**       | `/videos/:videoId`      |
  | **Authentication** | Required *(Owner only)* |
  | **Content-Type**   | `multipart/form-data`   |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Request Body
  
  | Field       | Type   | Required |
  | ----------- | ------ | :------: |
  | title       | string |     ❌    |
  | description | string |     ❌    |
  | thumbnail   | file   |     ❌    |
  
  > Any combination of the above fields can be supplied. Only the provided fields will be updated.
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Video updated successfully          |
  | **401** | Unauthorized request                |
  | **403** | You are not the owner of this video |
  | **404** | Video not found                     |
  | **500** | Internal server error               |
  
  ---
  
  ## Delete Video
  
  Permanently removes a video and its associated media from Cloudinary.
  
  | Property           | Value                   |
  | ------------------ | ----------------------- |
  | **Method**         | `DELETE`                |
  | **Endpoint**       | `/videos/:videoId`      |
  | **Authentication** | Required *(Owner only)* |
  | **Content-Type**   | `application/json`      |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Video deleted successfully          |
  | **401** | Unauthorized request                |
  | **403** | You are not the owner of this video |
  | **404** | Video not found                     |
  | **500** | Internal server error               |
  
  ---
  
  ## Toggle Publish Status
  
  Changes a video's visibility between published and unpublished.
  
  | Property           | Value                             |
  | ------------------ | --------------------------------- |
  | **Method**         | `PATCH`                           |
  | **Endpoint**       | `/videos/toggle/publish/:videoId` |
  | **Authentication** | Required *(Owner only)*           |
  | **Content-Type**   | `application/json`                |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Publish status updated successfully |
  | **401** | Unauthorized request                |
  | **403** | You are not the owner of this video |
  | **404** | Video not found                     |
  | **500** | Internal server error               |
  
  ---

  -------- -----------------------------
  # Tweets
  
  ---
  
  ## Create Tweet
  
  Creates a new tweet for the authenticated user.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `POST`             |
  | **Endpoint**       | `/tweets`          |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Request Body
  
  | Field   | Type   | Required |
  | ------- | ------ | :------: |
  | content | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                    |
  | :-----: | -------------------------- |
  | **201** | Tweet created successfully |
  | **400** | Content is required        |
  | **401** | Unauthorized request       |
  | **500** | Internal server error      |
  
  ---
  
  ## Get User Tweets
  
  Returns all tweets created by a specific user.
  
  | Property           | Value                  |
  | ------------------ | ---------------------- |
  | **Method**         | `GET`                  |
  | **Endpoint**       | `/tweets/user/:userId` |
  | **Authentication** | Required               |
  | **Content-Type**   | `application/json`     |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | userId    | string |
  
  ### Responses
  
  |  Status | Meaning                          |
  | :-----: | -------------------------------- |
  | **200** | Tweets retrieved successfully    |
  | **404** | User not found *(if applicable)* |
  | **500** | Internal server error            |
  
  ---
  
  ## Update Tweet
  
  Updates the content of an existing tweet.
  
  | Property           | Value                   |
  | ------------------ | ----------------------- |
  | **Method**         | `PATCH`                 |
  | **Endpoint**       | `/tweets/:tweetId`      |
  | **Authentication** | Required *(Owner only)* |
  | **Content-Type**   | `application/json`      |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | tweetId   | string |
  
  ### Request Body
  
  | Field   | Type   | Required |
  | ------- | ------ | :------: |
  | content | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Tweet updated successfully          |
  | **400** | Content is required                 |
  | **401** | Unauthorized request                |
  | **403** | You are not the owner of this tweet |
  | **404** | Tweet not found                     |
  | **500** | Internal server error               |
  
  ---
  
  ## Delete Tweet
  
  Permanently deletes an existing tweet.
  
  | Property           | Value                   |
  | ------------------ | ----------------------- |
  | **Method**         | `DELETE`                |
  | **Endpoint**       | `/tweets/:tweetId`      |
  | **Authentication** | Required *(Owner only)* |
  | **Content-Type**   | `application/json`      |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | tweetId   | string |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Tweet deleted successfully          |
  | **401** | Unauthorized request                |
  | **403** | You are not the owner of this tweet |
  | **404** | Tweet not found                     |
  | **500** | Internal server error               |
  
  ---
  
  # Subscriptions
  
  ---
  
  ## Toggle Subscription
  
  Subscribes to a channel if no active subscription exists. If already subscribed, the existing subscription is removed.
  
  | Property           | Value                         |
  | ------------------ | ----------------------------- |
  | **Method**         | `POST`                        |
  | **Endpoint**       | `/subscriptions/c/:channelId` |
  | **Authentication** | Required                      |
  | **Content-Type**   | `application/json`            |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | channelId | string |
  
  ### Responses
  
  |  Status | Meaning                              |
  | :-----: | ------------------------------------ |
  | **201** | Subscription created successfully    |
  | **200** | Subscription removed successfully    |
  | **400** | Cannot subscribe to your own channel |
  | **401** | Unauthorized request                 |
  | **404** | Channel not found *(if applicable)*  |
  | **500** | Internal server error                |
  
  ---
  
  ## Get Channel Subscribers
  
  Returns all users subscribed to a specific channel.
  
  | Property           | Value                         |
  | ------------------ | ----------------------------- |
  | **Method**         | `GET`                         |
  | **Endpoint**       | `/subscriptions/c/:channelId` |
  | **Authentication** | Required                      |
  | **Content-Type**   | `application/json`            |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | channelId | string |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Subscribers retrieved successfully  |
  | **404** | Channel not found *(if applicable)* |
  | **500** | Internal server error               |
  
  ---
  
  ## Get Subscribed Channels
  
  Returns every channel the specified user is currently subscribed to.
  
  | Property           | Value                            |
  | ------------------ | -------------------------------- |
  | **Method**         | `GET`                            |
  | **Endpoint**       | `/subscriptions/u/:subscriberId` |
  | **Authentication** | Required                         |
  | **Content-Type**   | `application/json`               |
  
  ### Path Parameters
  
  | Parameter    | Type   |
  | ------------ | ------ |
  | subscriberId | string |
  
  ### Responses
  
  |  Status | Meaning                                    |
  | :-----: | ------------------------------------------ |
  | **200** | Subscribed channels retrieved successfully |
  | **404** | User not found *(if applicable)*           |
  | **500** | Internal server error                      |

  -------- -------------------------------
  # Comments
  
  ---
  
  ## Get Video Comments
  
  Returns all comments associated with a specific video.
  
  | Property           | Value                |
  | ------------------ | -------------------- |
  | **Method**         | `GET`                |
  | **Endpoint**       | `/comments/:videoId` |
  | **Authentication** | Required             |
  | **Content-Type**   | `application/json`   |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Responses
  
  |  Status | Meaning                           |
  | :-----: | --------------------------------- |
  | **200** | Comments retrieved successfully   |
  | **404** | Video not found *(if applicable)* |
  | **500** | Internal server error             |
  
  ---
  
  ## Add Comment
  
  Creates a new comment for a video.
  
  | Property           | Value                |
  | ------------------ | -------------------- |
  | **Method**         | `POST`               |
  | **Endpoint**       | `/comments/:videoId` |
  | **Authentication** | Required             |
  | **Content-Type**   | `application/json`   |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Request Body
  
  | Field   | Type   | Required |
  | ------- | ------ | :------: |
  | content | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                      |
  | :-----: | ---------------------------- |
  | **201** | Comment created successfully |
  | **400** | Content is required          |
  | **401** | Unauthorized request         |
  | **404** | Video not found              |
  | **500** | Internal server error        |
  
  ---
  
  ## Update Comment
  
  Updates the content of an existing comment.
  
  | Property           | Value                    |
  | ------------------ | ------------------------ |
  | **Method**         | `PATCH`                  |
  | **Endpoint**       | `/comments/c/:commentId` |
  | **Authentication** | Required *(Owner only)*  |
  | **Content-Type**   | `application/json`       |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | commentId | string |
  
  ### Request Body
  
  | Field   | Type   | Required |
  | ------- | ------ | :------: |
  | content | string |     ✅    |
  
  ### Responses
  
  |  Status | Meaning                               |
  | :-----: | ------------------------------------- |
  | **200** | Comment updated successfully          |
  | **400** | Content is required                   |
  | **401** | Unauthorized request                  |
  | **403** | You are not the owner of this comment |
  | **404** | Comment not found                     |
  | **500** | Internal server error                 |
  
  ---
  
  ## Delete Comment
  
  Permanently removes an existing comment.
  
  | Property           | Value                    |
  | ------------------ | ------------------------ |
  | **Method**         | `DELETE`                 |
  | **Endpoint**       | `/comments/c/:commentId` |
  | **Authentication** | Required *(Owner only)*  |
  | **Content-Type**   | `application/json`       |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | commentId | string |
  
  ### Responses
  
  |  Status | Meaning                               |
  | :-----: | ------------------------------------- |
  | **200** | Comment deleted successfully          |
  | **401** | Unauthorized request                  |
  | **403** | You are not the owner of this comment |
  | **404** | Comment not found                     |
  | **500** | Internal server error                 |
  
  ---
  
  # Likes
  
  ---
  
  ## Toggle Video Like
  
  Creates a like if one does not already exist. If the authenticated user has already liked the video, the like is removed.
  
  | Property           | Value                      |
  | ------------------ | -------------------------- |
  | **Method**         | `POST`                     |
  | **Endpoint**       | `/likes/toggle/v/:videoId` |
  | **Authentication** | Required                   |
  | **Content-Type**   | `application/json`         |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | videoId   | string |
  
  ### Responses
  
  |  Status | Meaning                    |
  | :-----: | -------------------------- |
  | **201** | Video liked successfully   |
  | **200** | Video unliked successfully |
  | **401** | Unauthorized request       |
  | **404** | Video not found            |
  | **500** | Internal server error      |
  
  ---
  
  ## Toggle Tweet Like
  
  Creates a like if one does not already exist. If the authenticated user has already liked the tweet, the like is removed.
  
  | Property           | Value                      |
  | ------------------ | -------------------------- |
  | **Method**         | `POST`                     |
  | **Endpoint**       | `/likes/toggle/t/:tweetId` |
  | **Authentication** | Required                   |
  | **Content-Type**   | `application/json`         |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | tweetId   | string |
  
  ### Responses
  
  |  Status | Meaning                    |
  | :-----: | -------------------------- |
  | **201** | Tweet liked successfully   |
  | **200** | Tweet unliked successfully |
  | **401** | Unauthorized request       |
  | **404** | Tweet not found            |
  | **500** | Internal server error      |
  
  ---
  
  ## Toggle Comment Like
  
  Creates a like if one does not already exist. If the authenticated user has already liked the comment, the like is removed.
  
  | Property           | Value                        |
  | ------------------ | ---------------------------- |
  | **Method**         | `POST`                       |
  | **Endpoint**       | `/likes/toggle/c/:commentId` |
  | **Authentication** | Required                     |
  | **Content-Type**   | `application/json`           |
  
  ### Path Parameters
  
  | Parameter | Type   |
  | --------- | ------ |
  | commentId | string |
  
  ### Responses
  
  |  Status | Meaning                      |
  | :-----: | ---------------------------- |
  | **201** | Comment liked successfully   |
  | **200** | Comment unliked successfully |
  | **401** | Unauthorized request         |
  | **404** | Comment not found            |
  | **500** | Internal server error        |
  
  ---
  
  ## Get Liked Videos
  
  Returns every video liked by the authenticated user.
  
  | Property           | Value              |
  | ------------------ | ------------------ |
  | **Method**         | `GET`              |
  | **Endpoint**       | `/likes/videos`    |
  | **Authentication** | Required           |
  | **Content-Type**   | `application/json` |
  
  ### Responses
  
  |  Status | Meaning                             |
  | :-----: | ----------------------------------- |
  | **200** | Liked videos retrieved successfully |
  | **401** | Unauthorized request                |
  | **500** | Internal server error               |
  
  ---
  
  ## Notes
  
  * All protected endpoints require a valid **JWT Access Token**.
  * Access tokens can be supplied using either an **HTTP-only cookie** or the `Authorization: Bearer <token>` header.
  * Media uploads are stored in **Cloudinary**.
  * Passwords are securely hashed using **bcrypt** before storage.
  * Refresh tokens are persisted in the database and rotated during authentication.
  * Like and subscription operations implement **toggle behavior**, allowing the same endpoint to create or remove a record depending on the current state.
  * Compound database constraints ensure a user can like a specific video, tweet, or comment only once.
  
  ---
  
  **End of API Reference**


  -------- -----------------------------------

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
