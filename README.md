# Jhipster

This application was generated using JHipster 6.10.5, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v6.10.5](https://www.jhipster.tech/documentation-archive/v6.10.5).

This application was generated using JHipster 6.10.5 and JHipster .Net Core , you can find documentation and help at https://jhipsternet.readthedocs.io/en/latest/index.html and [https://www.jhipster.tech/documentation-archive/v6.10.5](https://www.jhipster.tech/documentation-archive/v6.10.5).

## Project Structure

Node is required for generation and recommended for development. `package.json` is always generated for a better development experience with prettier, commit hooks, scripts and so on.

In the project root, JHipster generates configuration files for tools like git, prettier, eslint, husky, and others that are well known and you can find references in the web.

- `.yo-rc.json` - Yeoman configuration file
  JHipster configuration is stored in this file at `generator-jhipster` key. You may find `generator-jhipster-*` for specific blueprints configuration.
- `.yo-resolve` (optional) - Yeoman conflict resolver
  Allows to use a specific action when conflicts are found skipping prompts for files that matches a pattern. Each line should match `[pattern] [action]` with pattern been a [Minimatch](https://github.com/isaacs/minimatch#minimatch) pattern and action been one of skip (default if ommited) or force. Lines starting with `#` are considered comments and are ignored.
- `.jhipster/*.json` - JHipster entity configuration files
- `docker/` - Docker configurations for the application and services that the application depends on
- `src/Jhipster/ClientApp/` - Web Application folder

## Development

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```
npm install
```

We use npm scripts and [Angular CLI][] with [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```
./mvnw
npm start
```

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is disabled by default. To enable it, uncomment the following code in `src/Jhipster/ClientApp/src/app/app.module.ts`:

```typescript
ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
```

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
npm install --save --save-exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
npm install --save-dev --save-exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Edit [src/Jhipster/ClientApp/src/app/app.module.ts](src/Jhipster/ClientApp/src/app/app.module.ts) file:

```
import 'leaflet/dist/leaflet.js';
```

Edit [src/Jhipster/ClientApp/src/content/scss/vendor.scss](src/Jhipster/ClientApp/src/content/scss/vendor.scss) file:

```
@import 'leaflet/dist/leaflet.css';
```

Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

### Using Angular CLI

You can also use [Angular CLI][] to generate some custom client code.

For example, the following command:

```
ng generate component my-component
```

will generate few files:

```
create src/Jhipster/ClientApp/src/app/my-component/my-component.component.html
create src/Jhipster/ClientApp/src/app/my-component/my-component.component.ts
update src/Jhipster/ClientApp/src/app/app.module.ts
```

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

In ./src/Jhipster/ClientApp run

    npm install

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    npm --prefix ./src/Jhipster/ClientApp start

npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm --prefix ./src/Jhipster/ClientApp run` command will list all of the scripts available to run for this project.

## Building for production

### .Net Production builds

To build the artifacts and optimize the Jhipster application for production, run:

```
cd ./src/Jhipster
rm -rf ./src/Jhipster/wwwroot
dotnet publish --verbosity normal -c Release -o ./app/out ./Jhipster.csproj
```

The `./src/Jhipster/app/out` directory will contain your application dll and its depedencies.

## Testing

### Client tests

Unit tests are run by [Jest][]. They're located in [src/Jhipster/ClientApp/test/](src/Jhipster/ClientApp/test/) and can be run with:

```
npm test
```

### .Net Backend tests

To launch your application's tests, run:

```
dotnet test --verbosity normal
```

## Others

### Code style / formatting

To format the dotnet code, run

```
dotnet format
```

### Code quality

By Script :

1. Run Sonar in container : `docker compose -f ./docker/sonar.yml up -d`

2. Wait container was up Run `SonarAnalysis.ps1` and go to http://localhost:9001

Manually :

1. Run Sonar in container : `docker compose -f ./docker/sonar.yml up -d`

2. Install sonar scanner for .net :

`dotnet tool install --global dotnet-sonarscanner`

3. Run ``dotnet sonarscanner begin /d:sonar.login=admin /d:sonar.password=admin /k:"Jhipster" /d:sonar.host.url="http://localhost:9001" /s:"`pwd`/SonarQube.Analysis.xml"``

4. Build your application : `dotnet build`

5. Publish sonar results : `dotnet sonarscanner end /d:sonar.login=admin /d:sonar.password=admin`

6. Go to http://localhost:9001

### Monitoring

1. Run container (uncomment chronograf and kapacitor if you would use it): `docker compose -f ./docker/monitoring.yml up -d`

2. Go to http://localhost:3000 (or http://localhost:8888 if you use chronograf)

3. (Only for chronograf) Change influxdb connection string by `YourApp-influxdb`

4. (Only for chronograf) Change kapacitor connection string by `YourApp-kapacitor`

5. (Only for chronograf) You can now add dashboard (like docker), see your app log in Cronograf Log viewer and send alert with kapacitor

### Build a Docker image

You can also fully dockerize your application and all the services that it depends on. To achieve this, first build a docker image of your app by running:

```bash
docker build -f ./Dockerfile-Back -t jhipster .
```

Then run:

```bash
docker run -p 8080:80 jhipster
```

Or you can simply run :

```bash
docker compose -f .\docker\app.yml build
```

And

```bash
docker compose -f .\docker\app.yml up
```

[JHipster Homepage and latest documentation]: https://www.jhipster.tech
[JHipster 6.10.5 archive]: https://www.jhipster.tech/documentation-archive/v6.10.5
[Using JHipster in development]: https://www.jhipster.tech/documentation-archive/v6.10.5/development/
[Using Docker and Docker-Compose]: https://www.jhipster.tech/documentation-archive/v6.10.5/docker-compose
[Using JHipster in production]: https://www.jhipster.tech/documentation-archive/v6.10.5/production/
[Running tests page]: https://www.jhipster.tech/documentation-archive/v6.10.5/running-tests/
[Code quality page]: https://www.jhipster.tech/documentation-archive/v6.10.5/code-quality/
[Setting up Continuous Integration]: https://www.jhipster.tech/documentation-archive/v6.10.5/setting-up-ci/
[Node.js]: https://nodejs.org/
[NPM]: https://www.npmjs.com/
[Webpack]: https://webpack.github.io/
[BrowserSync]: https://www.browsersync.io/
[Jest]: https://facebook.github.io/jest/
[Leaflet]: https://leafletjs.com/
[DefinitelyTyped]: https://definitelytyped.org/
[Angular CLI]: https://cli.angular.io/
