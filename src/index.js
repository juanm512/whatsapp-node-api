const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const bodyParser = require("body-parser");
const cors = require("cors");

const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
const contactRoute = require("./components/contact");
const config = require("../config.json");

const app = express();
app.use(cors());
// const allowedOrigins = ["http://201.212.231.34:3000"];
// app.use(
// 	cors({
// 		origin: (origin, callback) => {
// 			// allow requests with no origin
// 			// (like mobile apps or curl requests)
// 			if (!origin) return callback(null, true);
// 			if (allowedOrigins.indexOf(origin) === -1) {
// 				const msg =
// 					"The CORS policy for this site does not " +
// 					"allow access from the specified Origin.";
// 				return callback(new Error(msg), false);
// 			}
// 			return callback(null, true);
// 		},
// 	}),
// );

const port = process.env.PORT || config.port;

process.title = "whatsapp-node-api";

global.qr = null;
global.authed = false;

(async () => {
	try {
		//Set Request Size Limit 50 MB
		app.use(bodyParser.json({ limit: "50mb" }));

		app.use(express.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		const client = new Client({
			authStrategy: new LocalAuth(),
			webVersionCache: {
				remotePath:
					"https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1013518740-alpha.html",
				type: "remote",
			},
			puppeteer: {
				headless: true,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			},
		});
		await client.initialize();

		client.on("qr", (qr) => {
			console.log("Solicitud de qr!", qr);
			global.qr = qr;
		});

		client.on("loading_screen", (percent, message) => {
			console.log("LOADING SCREEN", percent, message);
		});

		client.on("ready", () => {
			console.log("Client is ready!");
			global.qr = null;
		});

		client.on("authenticated", () => {
			console.log("AUTH!");
			global.qr = null;
			authed = true;
		});

		client.on("auth_failure", () => {
			console.log("AUTH Failed !");
			global.qr = null;
			global.authed = false;
			// process.exit();
		});

		client.on("message", async (msg) => {
			// aca se puede hacer un webhook para que cuando se reciba un mensaje se ejecute una funcion
			// o se puede contestar con mensajes automáticos
			console.log("MENSAJE ENTRANTE ===>>> ", msg);
		});

		client.on("disconnected", () => {
			console.log("disconnected");
			global.qr = null;
			global.authed = false;
		});
		global.client = client;

		app.use((req, res, next) => {
			console.log(`${req.method} : ${req.path}`);
			next();
		});
		app.use("/auth", authRoute);
		app.use("/chat", chatRoute);
		app.use("/group", groupRoute);
		app.use("/contact", contactRoute);

		app.listen(port, "0.0.0.0", () => {
			console.log(`Server Running Live on Port : ${port}`);
		});
	} catch (err) {
		console.error("ERRORRR ==>> ", err);
		process.exit(1);
	}
})();
