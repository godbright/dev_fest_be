import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index";

const app = express();

app.use(express.json({ limit: "50mb" }));

app.use(
  cors({
    origin: "*",
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Content-Type, Authorization, X-Requested-With"
  );
  next();
});

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
app.use("/api", routes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Emergency Social Network" });
});

app.use((err, req, res, next) => {
  const { status, message } = err;

  res.status(status || 500).json({
    success: false,
    code: status,
    message: message || "Something went Wrong",
    stack: err.stack,
  });
});

export default app;
