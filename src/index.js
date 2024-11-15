import app from "./app";
import db from "./database/models";
const port = process.env.PORT || 3000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log(`Connected to ${process.env.NODE_ENV} database`);
  } catch (error) {
    console.log("Error connecting to the db", error);
  }
})();

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server started at ${process.env.APP_URL}:${port}`);
});
