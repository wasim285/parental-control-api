# Parental Control API

## Overview

The Parental Control API is a backend system that allows parents to manage and monitor children's digital screen time, control content access, and generate usage reports. This API provides features such as user authentication, content filtering, screen time management, and generating reports of users' digital activity.

This project aims to provide an efficient backend system for parental control applications, offering parents the ability to maintain healthy boundaries on their children's digital activities.

## Features

- **User Authentication**: Secure registration and login using JSON Web Tokens (JWT).
- **Content Filtering**: Allows users to add, view, and remove content restrictions.
- **Screen Time Management**: Set daily screen time limits, log screen time sessions, and track violations if limits are exceeded.
- **Reporting**: Generates detailed reports on user activities, including screen time logs, content restrictions, total usage duration, daily screen time violations, and average usage summaries.

## Technologies Used

- **Node.js**: JavaScript runtime environment for backend development.
- **Express.js**: Fast and lightweight web application framework for Node.js.
- **MySQL**: Relational database used for persistent data storage.
- **JWT**: Used for authenticating users securely.
- **Postman**: For testing API endpoints during development.

## Installation and Setup

### Prerequisites

- **Node.js** (>= 14.x.x)
- **MySQL** installed and running
- **npm** or **yarn** for dependency management

### Step-by-Step Setup

1. **Clone the Repository**:

    ```sh
    git clone https://github.com/your-username/parental-control-api.git
    cd parental-control-api
    ```

2. **Install Dependencies**:

    ```sh
    npm install
    ```

3. **Set Up MySQL Database**:

    - Create a new database in MySQL named `parental_control`:

      ```sql
      CREATE DATABASE parental_control;
      ```

    - Import tables and setup from `db_setup.sql` (if available).

4. **Configure Environment Variables**:

    - Create a `.env` file in the root directory and add the following:

      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASS=yourpassword
      DB_NAME=parental_control
      JWT_SECRET=your_jwt_secret
      PORT=4000
      ```

5. **Run the Application**:

    ```sh
    npx nodemon src/index.js
    ```

    The server should now be running at `http://localhost:4000`.

## API Endpoints

### Authentication

- **Register User**: `POST /api/auth/register`
  - **Body**: `{ "username": "user1", "password": "password" }`
- **Login User**: `POST /api/auth/login`
  - **Body**: `{ "username": "user1", "password": "password" }`

### Screen Time Management

- **Set Screen Time Limit**: `POST /api/screen-time/set`
  - **Body**: `{ "dailyLimit": 180, "startTime": "09:00:00", "endTime": "21:00:00" }`
- **Start Screen Time**: `POST /api/screen-time/start`
- **Stop Screen Time**: `POST /api/screen-time/stop`
- **Get Screen Time Logs**: `GET /api/screen-time/logs`

### Content Restrictions

- **Add Content Restriction**: `POST /api/content/add`
  - **Body**: `{ "url": "example.com" }`
- **Get Content Restrictions**: `GET /api/content/list`
- **Remove Content Restriction**: `DELETE /api/content/remove/:id`

### Reports

- **Get User Report**: `GET /api/reports/user/{userId}`
  - Provides:
    - Screen Time Logs
    - Content Restrictions
    - Total Screen Time Duration
    - Daily Durations Summary
    - Average Daily Time
    - Violations (if daily limits are exceeded)

## Database Schema

### Users Table

| Column     | Type         | Details               |
|------------|--------------|-----------------------|
| id         | INT          | Primary Key, Auto Increment |
| username   | VARCHAR(255) | Unique                |
| password   | VARCHAR(255) | Hashed Password       |
| created_at | TIMESTAMP    | Default Current Time  |
| email      | VARCHAR(255) | (Optional)            |

### Screen Time Limits Table

| Column     | Type         | Details                 |
|------------|--------------|-------------------------|
| id         | INT          | Primary Key, Auto Increment |
| user_id    | INT          | Foreign Key referencing users.id |
| daily_limit| INT          | Limit in minutes        |
| start_time | TIME         | Optional Start Time     |
| end_time   | TIME         | Optional End Time       |
| created_at | TIMESTAMP    | Default Current Time    |

### Screen Time Logs Table

| Column     | Type         | Details                     |
|------------|--------------|-----------------------------|
| id         | INT          | Primary Key, Auto Increment |
| user_id    | INT          | Foreign Key referencing users.id |
| start_time | TIMESTAMP    | Default Current Time        |
| end_time   | TIMESTAMP    | NULL until session ends     |

## Testing

- **Using Postman**: The Postman collection (`Parental_Control_API_Testing.postman_collection.json`) is available to automate endpoint testing. ## Postman Collection

A Postman collection is included in this repository for easy testing of the Parental Control API.

You can find it in the `postman` folder:

- `postman/Parental_Control_API_Collection.json`

To use it, import this file into Postman and set up the necessary environment variables for testing.

- **Test Coverage**:
  - User Authentication
  - Screen Time Limits
  - Content Restriction Features
  - Report Generation

## Project Status

This project is in the final stages of development. It provides essential features for parental control, such as screen time management, content restrictions, and reporting. Future iterations could focus on enhancing report details, supporting multiple platforms, or creating a front-end interface.

## Usage

This backend API could be deployed and connected to a front-end application, providing parents an interface to:
- Register accounts
- Set up daily screen time limits
- Add content restrictions for devices
- Monitor children’s screen usage and content accessed

## Future Improvements

- **Automate Logging**: Automatically log user activity based on usage events.
- **Advanced Analytics**: Implement machine learning to predict potential content of concern.
- **Front-end Interface**: Develop a front-end interface for easy access.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any questions or contributions:

- Email: wasimu285@egmail.com
- GitHub: [wasim285](https://github.com/wasim285)

