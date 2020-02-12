# Palette Picker 

## Creators
- Garrett Iannuzzi - [github](https://github.com/Garrett-Iannuzzi)
- John Adams - [github](https://github.com/adamsjr8576)

## Overview:
Palette Picker lets a user create color palettes for any project they may be working on. The user has the ability to save projects and palettes for those projects. The user can also edit/update saved projects and color palettes, and delete projects and palettes.

This project was completed over 12 days at the Turing School for Software and Design. You can find coresponding FE repo [Palette Picker FE](https://github.com/adamsjr8576/palette-picker-fe).

## Tech Stack:
- Express.js
- Knex
- Node.js
- JavaScript
- Postgres
- Jest / Enzyme

## Setup:
1. Clone doen the repo Palette Picker
2. Run `npm install`
3. Run `npm start`

## Endpoints:

All URLs have the following base URLs:

- http://localhost:3000 for the local enviornment
- https://palette-selector.herokuapp.com for the remote version.

|  **Purpose** 	| **Prefix For All URL's: `http://localhost:3000/`**  	| **Verb**  	| **Request Body**  	|   **Sample Success Response** |
|---	|---	|---	|---	|---	|
|   **Get all projects**	|  `/api/v1/projects` 	| GET  	|   N/A	|  ```[{ "id": 2,"name": "Project Two", "created_at": "2020-02-04T20:59:00.114Z", "updated_at": "2020-02-04T20:59:00.114Z" }, { "id": 1, "name": "Project One", "created_at": "2020-02-04T20:12:20.932Z", "updated_at": "2020-02-04T20:12:20.932Z" },  ...]``` 	|
|   **Get a palette by ID**	|   `/api/v1/palettes/:id`	|  GET	|  N/A 	| ```{ "colors": [ "#11111", "#11111", "#11111", "#111111", "#11111" ], "id": 1, "name": "GOOD NAME", "project_id": 1, "created_at": "2020-02-04T20:12:20.944Z" "updated_at": "2020-02-04T20:12:20.944Z" } ``` 	|
|  **Get project by ID** 	|  `/api/v1/projects/:id` 	|  GET 	|  N/A 	| ```{ "id": 1, "name": "Project One", "created_at": "2020-02-04T20:12:20.932Z", "updated_at": "2020-02-04T20:12:20.932Z" }``` 	|
|   **Get all palletes for a project by project ID**	| `/api/v1/projects/:id/palettes`  	|  GET 	| N/A  	| ```[{ "colors": [ "#11111", "#11111", "#11111", "#111111", "#11111" ], "id": 1, "name": "GOOD NAME", "project_id": 1, "created_at": "2020-02-04T20:12:20.944Z", "updated_at": "2020-02-04T20:12:20.944Z" } ...]```  	|
|  **Add a project** 	|  `/api/v1/projects` 	|  POST 	|  ```{ name: "New Project Name" }``` 	|   ```{ id: 12 }```	|
|  **Add a palette** 	|  `/api/v1/palettes` 	|  POST 	| ```{ "name": "Palette Blue", "project_id": 2, "color_one": "#87085", "color_two": "#87085", "color_three": "#87085", "color_four": "#87085", "color_five": "#87085" }```  	| ```{ id: 7 }```  	|
|  **Add a palette to existing project** 	|   `/api/v1/palettes/:id`	|  PATCH 	| ```{ "color_one": "#11111", "color_two": "#11111", "color_three": "#11111" "color_four": "#111111", "color_five": "#11111" }```  	| ```{ "colors": [ "#11111", "#11111", "#11111", "#111111", "#11111" ], "id": 7, "name": "Palette Blue", "project_id": 2, "created_at": "2020-02-05T02:57:59.235Z", "updated_at": "2020-02-05T02:57:59.235Z" }```	|
|   **Change the name of a project**	|  `/api/v1/projects/:id` 	|  PATCH 	|  ```{ name: "New Project Name" }``` 	| ```{ "id": 1, "name": "New Project Name", "created_at": "2020-02-04T20:12:20.932Z", "updated_at": "2020-02-04T20:12:20.932Z" }```	|
|  **Remove a project by ID** 	|   `/api/v1/projects/:id`	|  DELETE 	| N/A  	| ```{ "message": "Success: Project has been removed" }```	|
|  **Remove a palette by ID** 	|  `/api/v1/palettes/:id`	|  DELETE 	|   N/A	| ```{ "message": "Success: Palette has been removed" }```	|
