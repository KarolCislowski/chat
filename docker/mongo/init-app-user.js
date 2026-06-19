const dbName = process.env.MONGO_APP_DATABASE || process.env.MONGO_INITDB_DATABASE;
const username = process.env.MONGO_APP_USERNAME;
const password = process.env.MONGO_APP_PASSWORD;

if (!dbName || !username || !password) {
  throw new Error("Missing MongoDB application database or user configuration.");
}

const appDb = db.getSiblingDB(dbName);

appDb.createUser({
  user: username,
  pwd: password,
  roles: [{ role: "readWrite", db: dbName }],
});

appDb.createCollection("app_metadata");
