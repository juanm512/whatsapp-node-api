const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const bodyParser = require("body-parser");
const qrcode = require("qrcode");
// const fs = require("fs");
// const axios = require("axios");
// const shelljs = require("shelljs");

const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
const contactRoute = require("./components/contact");
const config = require("../config.json");

const app = express();
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
			// fs.writeFileSync("./components/last.qr", qr);
			// qrcode.toString("Solicitud de qr!", { type: "terminal" }, (err, url) => {
			// 	console.log(url);
			// });
			qrcode.toDataURL(qr, (err, url) => {
				global.qr = url;
			});
		});

		client.on("loading_screen", (percent, message) => {
			console.log("LOADING SCREEN", percent, message);
		});

		client.on("ready", () => {
			console.log("Client is ready!");
		});

		client.on("authenticated", () => {
			console.log("AUTH!");
			authed = true;
			global.qr = null;
			// try {
			// 	fs.unlinkSync("./components/last.qr");
			// } catch (err) {}
		});

		client.on("auth_failure", () => {
			console.log("AUTH Failed !");
			process.exit();
		});

		client.on("message", async (msg) => {
			// if (config.webhook.enabled) {
			// 	if (msg.hasMedia) {
			// 		const attachmentData = await msg.downloadMedia();
			// 		msg.attachmentData = attachmentData;
			// 	}
			// 	axios.post(config.webhook.path, { msg });
			// }
			console.log("MENSAJE ENTRANTE ===>>> ", msg);
		});

		client.on("disconnected", () => {
			console.log("disconnected");
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

		app.listen(port, () => {
			console.log(`Server Running Live on Port : ${port}`);
		});
	} catch (err) {
		console.error("ERRORRR ==>> ", err);
		process.exit(1);
	}
})();
