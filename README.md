# Running locally

Once you've done the setup below, this should be all you need to run the app.

`npm run server`

It will automatically start in HTTPS mode, so the default local URL is https://localhost:5000

If you're working on HTML/CSS/JS as well as server side stuff, also run `npm run watch` (you need to do both)

# Setting up for local development

All of this should be one-time setup. If you make changes that impact other developers setting up to work on this code, be sure to update this!

These are the key steps. Some of these things are explained below in more detail.

 * Check out the repository
 * copy `env.sh.example` to `env.sh`
 * Look through the file to see if you need to edit anything. (read the comments)
 * run `source env.sh`
 * Copy `app/server/scenevr_client_secret.json.example` to `app/server/scenevr_client_secret.json` and fill in the required Google auth account info. This .json file is gitignored and should not be committed to the repository.
 * Make a python virtual environment
 * run `pip install -r requirements.txt`
 * run `npm install`
 * run `npm run devinit`

The above should all be something you only have to do once.

* run `npm run server`
* open `https://localhost:5000/` in your browser. The first time, you'll have to confirm a security exception for your self-signed certificate.

If you're working on HTML/CSS/JS as well as server side stuff:
* run `npm run watch`

## Server development
### Shell environment

Copy `env.sh.example` to `env.sh`. If you use `virtualenvwrapper`, you will probably want to add a `postactivate` hook to source `env.sh` when you `workon` this environment.

### Python environment

First, create a python virtual environment (using Python 3.6) and install the requirements as listed in `requirements.txt`

### Node environment setup

To set up the Javascript packages, run `npm install`
If you're developing HTML and CSS, run `npm run watch` to set up live reloading of Javascript files.
If nothing else, you'll need to run `npm run build` the first time you check out the repository (this command is included in `npm run devinit`)

### Local SSL setup
Google Authentication requires using SSL. So, even for local development, you must run your test server under SSL.
The easy way to do this is with `npm run makecert` which handles the details below

first, execute this command in the local root of the repository:

`openssl req -x509 -nodes -days 10000 -newkey rsa:2048 -out local_only.crt -config self_signed.cfg`

Use exactly these names for the key and cert file and store them in the root of your repository (they are `.gitignore`d).
(Note that the hardcoded paths to the files require that you start the app from the root of the repository)

Also, to work with Google Authentication, you need a copy of `scenevr_client_secret.json` in the root of your repository.
Get that from someone on staff.

### Database setup

This is setup is for SQLite3. For Postgresql setup, see *Using Postgres* below. 

Once you have all the dependencies installed, you should be able to run

    python app/server/api.py initdb

This assumes you have `sqlite3`. It should create the DB file in the local repository folder, in the `gitignore`'d `.data` directory, unless you changed `DATABASE_URI` in `env.sh`

#### Using Postgres

Postgresql is used for deployment and may optionally be used for local development. It is assumed that you've already installed Postgres on your system.

Install psycopg2:

```
 $ pip install psycopg2-binary
```

Create the database:

```
 $ createdb scenevr
```

Set the DATABASE_URI environment variable. Note: you will want to add this to your env.sh file:

```
 $ export DATABASE_URI=postgresql://username:password@localhost/scenevr
```

Init the database as usual:

```
 $ python app/server/api.py initdb
```

## Client development

Run `npm run watch` to have JS and CSS changes automatically updated.
Of course, you'll also have to be running the server. You can do that with `npm run server`  
You'll probably want to do this in separate terminal windows so that you can see console output from each separately although we could make an npm script which runs both in parallel.

Once it's running, go to https://localhost:5000/ in your browser. Note that `127.0.0.1` won't work correctly with Google authentication.

# Some Flask interactive tricks

in case you're new to it...

Start a shell:
```
$ FLASK_APP="app/server/api.py" flask shell
```

In the shell, basics to do stuff:

```
>>> ctx = app.test_request_context()
>>> ctx.push()
# do whatcha wanna
>>> ctx.pop() # I guess when you're done?
```

but to fool with the DB, you can just do this without the `ctx` stuff:
```
>>> import models
>>> models.Scene.query.all()
[<Scene 6>, <Scene 5>, <Scene 7>]
```
