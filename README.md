## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#Prerequisites)
- [Available Scripts](#available-scripts)
- [Setup](#setup)
- [Docker Setup](#docker-setup)
- [File Structure](#file-structure)
- [Application Security](#application-security)
- [Contributing](#contributing)
- [Sponsors](#sponsors)
- [License](#license)
- [Acknowledgement](#acknowledgement)

---


## Prerequisites

NodeJS
https://nodejs.org/en/

Typescript
https://www.typescriptlang.org/

PostgresQL
https://www.postgresql.org/

Redis
https://redis.io/

---

## Available Scripts


In the project directory, you can run:

### `yarn start:dev`

Runs the app in the development & watch mode.<br>
Open [http://localhost:7777/api-docs](http://localhost:7777/api-docs) to view swagger API docs in browser (only available in development mode).<br>
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br>

### `yarn lint`

Lints all the files inside src,apps,libs,test folders and shows the results.

### `yarn format`

Formats all the files inside src using prettier with config provided in .prettierrc

### `yarn format`

Formats all the files inside src using prettier with config provided in .prettierrc

### `yarn coverage`

Runs coverage test command and creates coverage folder with detail report which can be checked with:
```bash
yarn coveralls
```

### `yarn orm-create migration_file_name`

Uses Type ORM to create a migration file. `migration_file_name` is Migration file name to be created.

### `yarn migrate`

This command is used to migrate existing migration file.

### `yarn migration:rollback`

This command is used to rollback migration.

### `yarn seed`

This command is used to run existing seeders.

---

## Setup
clone it using

```bash
git clone https://gitlab.com/medex4/medex_backend.git
```
**You also need to run PostgresQL for database and Redis for key-val storage which will be used for queue and throttling.**
After cloning the make changes in configuration file that exists in config folder which exists in root of project.
File names are named in accordance with environment you run project with. For example if you're running project in development environment you should make change in configuration of development.yml file. 
**Please keep in mind environment variables always overrides the config.**

If you want to run locally,
```bash
yarn start
```
*If you want to view swagger docs on development open http://localhost:7777/api-docs (assuming you are running application on 7777 port)*

Run Migration
```bash
yarn migrate
```

Run Seeders
```bash
yarn seed
```

Rollback Migration
```bash
yarn migration:rollback
```

---

## Docker Setup

**If you want to run project without docker you will not need to create .env file**

If you want to use **Docker** to deploy it on production or development stage
First create a .env file copying from .env.example and add environment for below parameters only since it will be used for building container using docker-compose

```env
SERVER_PORT=7777
DB_PASSWORD=root
DB_USERNAME=postgres
DB_DATABASE_NAME=medex
DB_PORT=5488
REDIS_PORT=6399
```

After creating env file make changes in configuration in accordance with you development environment. Follow setup guide in case you missed it.
 
Now to run containers do
```bash
docker-compose build .
docker-compose up -d
```
These commands will run 3 containers for PostgresQL, Redis and Main API.

To run migration on docker container
```bash
docker exec -it <container_id_or_name> yarn migrate
```

To run seeder on docker container
```bash
docker exec -it <container_id_or_name> yarn seed
```

---

## File Structure

This project follows the following file structure:

```text
medex
├── config                                  * Contains all configuration files
│   └── default.yml                         * Default configuration file.
│   └── development.yml                     * Configuration file for development environment.
│   └── production.yml                      * Configuration file for production environment.
│   └── test.yml                            * Configuration file for test environment.    
├── coverage                                * Coverage reports after running `yarn coverage` command. 
├── dist                                    * Optimized code for production after `yarn build` is run.
├── images                                  * this folder is where uploaded profile images are stored. This folder is git ignored.
├── src                  
│   └── <module>                            * Folder where specific modules all files are stored
│       └── dto                             * Data Transfer Objects.
│       └── entity                          * Models for module.
│       └── pipes                           * Includes validation pipes for NestJS modules.
│       └── serializer                      * Includes serializer for model data.
│       └── <module>.controller.ts          * Controller file.
│       └── <module>.module.ts              * root module file for module.
│       └── <module>.service.ts             * Service file for <module>.
│       └── <module>.service.spec.ts        * Test file for service.
│       └── <module>.repository.ts          * Repository file for <module>.
│       └── <module>.repository.spec.ts     * Test file for repository.
│   └── common                              * Common helpers function, dto, entity, exception, decorators etc.
│   └── config                              * Configuration variables files.
│   └── database                            * Database folders that includes migration and seeders file
│       └── migrations                      * Migration folder includes all migration files.
│       └── seeds                           * Seeds folder includes all seeders files.
│   └── exception                           * Exception folder includes custom exceptions.
│   └── app.module.ts                       * Root module of the application.
│   └── main.ts                             * The entry file of the application which uses the core function NestFactory to create a Nest application instance.
├── test                                    * Contains E2E tests 
```

**Some important root files**

```text
.
├── .editorconfig                           * Coding styles (also by programming language).
├── .env                                    * Environment variables for docker.
├── .prettierrc.js                          * Formatting Prettier options.
├── .eslintrc.js                            * ESLint configuration and rules.
├── .docker-compose.yml                     * Docker compose configuration.
├── Dockerfile                              * Docker file for prod environment.
├── Dockerfile.dev                          * Docker file for dev environment.
├── tsconfig.json                           * Typescript configuration for application.
```

