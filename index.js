const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST;

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"http://localhost:5174",
	"https://book-doctor-frontend.vercel.app",
	"https://bookdoctor.duckdns.org",
];

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	credentials: true,
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes);

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	})
	.then(() => console.log("Connected to DB"))
	.catch((err) => {
		console.error("Mongo DB connection error", err);
	});

mongoose.connection.on("error", (err) => {
	console.error("MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
	console.log("MongoDB disconnected");
});
mongoose.connection.on("SIGINT", async () => {
	await mongoose.connection.close();
});
app.get("/", (req, res) => {
	res.send("Backend works");
});

app.listen(port, host, () => {
	console.log(`Server running on port: ${port} and host: ${host}`);
});
