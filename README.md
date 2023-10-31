# Raspberry Pi Web Server

This is a simple Raspberry Pi-hosted web server written in [Express](http://expressjs.com/) and [Node.js](http://nodejs.org/). The server serves a [single-page application](https://github.com/Kadinata/raspi_web_app) written in [React](https://react.dev/) and provides RESTful APIs for functionalities including:

* New user registration and user authentication
* Reading system information in real time
* Controlling GPIO pins and reading their states in real time

This project is the result of my ongoing effort to learn various web development technologies with emphasis on servers hosted on embedded Linux devices.

## Installation & Setup

* Prerequisites
  * Make sure Node.js and npm are installed on the Raspberry Pi

  ```bash
  # 1. Clone the repository

  cd <project_dir>
  git clone https://github.com/Kadinata/raspi_web_server.git .


  # 2. If the project was cloned to a personal machine,
  # push the project contents to a Raspberry Pi

  rsync -avz --delete --exclude=node_modules --exclude=public --exclude=db --exclude=*.sh --exclude=coverage --exclude=__tests__ --exclude=app_data --exclude=.git -e ssh . <your raspberry pi>:<project dir>


  # 3. Login to the Raspberry Pi and install Node modules

  ssh <your raspberry pi>
  cd <project dir>
  node install


  # 4. Copy the single page app build 
  # Clone the web app from this repository: https://github.com/Kadinata/raspi_web_app
  # Run "npm run build" to build it and copy the contents of the build directory into this repo's public directory

  
  # 5. Launch the server
  node index.js
  ```

The final step should have launched a web server listening on port `3000` which serves the single page application. The page can be viewed at [raspberrypi.local:3000](http://raspberrypi.local:3000/)

## Tests

Use the following command to run all tests:

```
npm run test
```

Or to run tests on a specific file

```
npm run test -- <path to test file>
```

## APIs

With the exception of the single page application, all API endpoints share the common `/api/v1` root path. For example, the API endpoint for a new user registration is `/api/v1/auth/register`.

### Auth Endpoints

Endpoint | Method | Body (JSON) | Requires Authentication? | Description
:--- | :---: | :--- | :---: | :---
`/auth/register` | `POST` | `username` <br/> `password` | NO | Create a new user with the provided username and password and stores it in the database.
`/auth/login` | `POST` | `username` <br/> `password` | NO | Authenticate a user with the provided username and password. <br/> If authentication is successfull, a JSON Web Token bearing the user information is returned in the response.
`/auth/user` | `GET` | None | YES | Returns the current user information.
`/auth/update_password` | `POST` | `username` <br/> `password` <br/> `newPassword` | YES | Update the user's current password to the new password.

### System Resources Information Endpoints

Endpoint | Method | Body (JSON) | Requires Authentication? | Description
:--- | :---: | :--- | :---: | :---
`/sysinfo` | `GET` | None | YES | Returns a comprehensive snapshot of system resources information
`/sysinfo/stream` | `GET` | None | YES | Subscribe to a real-time system resources information stream

### GPIO Endpoints

Endpoint | Method | Body (JSON) | Requires Authentication? | Description
:--- | :---: | :--- | :---: | :---
`/gpio` | `GET` | None | YES | Returns the current state (logic level and direction) of all GPIO pins
`/gpio` | `POST` | *See notes | YES | Send commands to change the logic levels and/or directions of one or more GPIO pins
`/gpio/usable_pins` | `GET` | None | YES | Returns a list of controllable GPIO pin numbers
`/gpio/stream` | `GET` | None | YES | Subscribe to a real-time system GPIO pins status update stream

*Notes:*

* The `/gpio POST` endpoint takes an object with GPIO pin numbers as the key and control flag as the values. The first LSB of the control flag determines the logic level of the GPIO pin, and the second LSB determines the pin's direction. For example, `{ "2": 3, "4":2 }` configures GPIO pin 2 to output and `HIGH` and GPIO pin 4 to output and `LOW` while leaving the other GPIO pins as they are.

### Heartbeat (Keep Alive) Endpoints

Endpoint | Method | Body (JSON) | Requires Authentication? | Description
:--- | :---: | :--- | :---: | :---
`/heartbeat` | `GET` | None | YES | Used by the SPA to detect connection loss

## Technologies

Tools, frameworks, and libraries used in this project

Domain | Library / Framework
:--- | :---
HTTP Server | [Express](http://expressjs.com/), [Node.js](http://nodejs.org/)
Authentication | [Passport.js](https://www.passportjs.org/), [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken)
Database | [SQLite3](https://github.com/TryGhost/node-sqlite3)
Password Hashing | [BCrypt](https://github.com/kelektiv/node.bcrypt.js#readme)
GPIO Control | [onoff](https://github.com/fivdi/onoff)
Logging | [Winston](https://github.com/winstonjs/winston), [Morgan](https://github.com/expressjs/morgan)
Testing | [Jest.js](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest#readme)
