# Running locally

Once you've done the setup below, this should be all you need to run the app.

`python app/server/api.py`

It will automatically start in HTTPS mode, so the default local URL is https://localhost:5000


# Setting up for local development

All of this should be one-time setup. If you make changes that impact other developers setting up to work on this code, be sure to update this!

## Shell environment

Copy `env.sh.example` to `env.sh`. If you use `virtualenvwrapper`, you will probably want to add a `postactivate` hook to source `env.sh` when you `workon` this environment.

(As of right now, nothing in that file actually matters, but it will as we build this out.)

## Python environment

First, create a python virtual environment (using Python 3.6) and install the requirements as listed in `requirements.txt`

## Node environment setup

To set up the Javascript packages, run `npm install`
and then `npm run start` to set up live reloading of Javascript files.

## Local SSL setup
Second, Google Authentication requires using SSL. So, even for local development, you must run your test server under SSL.

first, execute this command in the local root of the repository:

`openssl req -x509 -sha256 -nodes -days 10000 -newkey rsa:2048 -keyout local_only.key -out local_only.crt`

Use exactly these names for the key and cert file and store them in the root of your repository (they are `.gitignore`d).
(Note that the hardcoded paths to the files require that you start the app from the root of the repository)

Also, to work with Google Authentication, you need a copy of `scenevr_client_secret.json` in the root of your repository.
Get that from someone on staff.

## Database setup

Once you have all the dependencies installed, you should be able to run

    python app/server/api.py initdb

This assumes you have `sqlite3` and that you have a `/tmp` directory  (all Macs fit both. When we have a Windows dev, we may need to tweak.)