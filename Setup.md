# Recommon setup frontend with Vercel and backend with Render
Here are tips for deployment both frontend and backend.

## Register Turso and create a database
#### _step 1._ Go to Turso platform and register.

#### _step 2._ Then save an apikey and URL.

#### _step 3._ Fork this repo in github and create a codespace.

#### _step 4._ Create **.env** doc under **backend/.** 

And write following content:
```
TURSO_DATABASE_URL='libsql://your database url.turso.io'
DATABASE_URL='file:./dev.db'
TURSO_AUTH_TOKEN='your apikey'
```
#### _step 5._ Run these command in Terminal to create a database.

   ```bash
   cd backend
   npm install
   npm run db:push:turso
   ```

## Backend
#### _step 1._ Go to Render platform and deploy website using this github URL.

#### _step 2._ Assign working(or deployment file) to **backend** dir

#### _step 3._ Assign env var

```bash
  TURSO_DATABASE_URL='libsql://your database url.turso.io'
  TURSO_AUTH_TOKEN='your apikey'
  PORT=8000
  NODE_ENV=production
  FRONTEND_URL=https://your project name.vercel.app
   ```
Once **Frontend** be deployed in Vercel, you must go back here to adjust **FRONTEND_URL** with the exact URL.

#### _step 4._ Now you can deploy this  repo and copy the URL of it.

URL fomat be like

```bash
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

## Frontend
#### _step 1._ Assign working(or deployment file) to **frontend** dir

#### _step 2._ Assign env var

```bash
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

_step 3._ Now you can deploy this  repo and copy the URL of it.

Go back to Render and adjust **FRONTEND_URL** with vercel project url.
