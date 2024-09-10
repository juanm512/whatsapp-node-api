const router = require("express").Router();
const { MessageMedia, Location } = require("whatsapp-web.js");
// const request = require("request");
// const vuri = require("valid-url");
// const fs = require("fs");

// const mediadownloader = (url, path, callback) => {
// 	request.head(url, (err, res, body) => {
// 		request(url).pipe(fs.createWriteStream(path)).on("close", callback);
// 	});
// };

// Función para validar el formato del número de teléfono
function isValidPhone(phone) {
	// Código de área (2 a 4 dígitos) seguido de un número de 6 dígitos, sin guiones ni espacios
	const phoneRegex = /^\d{1,3}9\d{2,4}\d{6}$/;

	return phoneRegex.test(phone);
}

router.post("/sendmessage/:phone", async (req, res) => {
	const phone = req.params.phone;
	const message = req.body.message;

	if (!isValidPhone(phone) || !message) {
		return res.status(400).json({
			success: false,
			status: "invalid_input",
			data: null,
			error:
				"Please enter a valid phone number: (1-2) caracteres codigo pais + numero 9 + (2-4) codigo area + (6) numero real ) and a message",
		});
	}

	console.log(phone, message);

	try {
		const response = await global.client.sendMessage(`${phone}@c.us`, message);
		if (response.id.fromMe) {
			return res.json({
				success: true,
				status: "message_sent",
				data: { phone, message },
				error: null,
			});
		}
	} catch (error) {
		console.error("Error sending message:", error);
		return res.status(500).json({
			success: false,
			status: "send_message_error",
			data: null,
			error: "Error sending message",
		});
	}
});

router.post("/sendlocation/:phone", async (req, res) => {
	const phone = req.params.phone;
	const { latitude, longitude, description = "" } = req.body;

	if (!isValidPhone(phone) || !latitude || !longitude) {
		return res.status(400).json({
			success: false,
			status: "invalid_input",
			data: null,
			error: "Please enter a valid phone number, latitude, and longitude",
		});
	}

	try {
		const loc = new Location(latitude, longitude, description);
		const response = await global.client.sendMessage(`${phone}@c.us`, loc);
		if (response.id.fromMe) {
			return res.json({
				success: true,
				status: "location_sent",
				data: { phone, location: { latitude, longitude, description } },
				error: null,
			});
		}
	} catch (error) {
		console.error("Error sending location:", error);
		return res.status(500).json({
			success: false,
			status: "send_location_error",
			data: null,
			error: "Error sending location",
		});
	}
});

router.get("/getchatbyid/:phone", async (req, res) => {
	const phone = req.params.phone;

	if (!isValidPhone(phone)) {
		return res.status(400).json({
			success: false,
			status: "invalid_input",
			data: null,
			error: "Please enter a valid phone number",
		});
	}

	try {
		const chat = await global.client.getChatById(`${phone}@c.us`);
		return res.json({
			success: true,
			status: "chat_fetched",
			data: chat,
			error: null,
		});
	} catch (error) {
		console.error("Error fetching chat:", error);
		return res.status(500).json({
			success: false,
			status: "get_chat_error",
			data: null,
			error: "Error fetching chat",
		});
	}
});

router.get("/getchats", async (req, res) => {
	try {
		const chats = await global.client.getChats();
		return res.json({
			success: true,
			status: "chats_fetched",
			data: chats,
			error: null,
		});
	} catch (error) {
		console.error("Error fetching chats:", error);
		return res.status(500).json({
			success: false,
			status: "get_chats_error",
			data: null,
			error: "Error fetching chats",
		});
	}
});

// router.post("/sendimage/:phone", async (req, res) => {
// 	const base64regex =
// 		/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

// 	const phone = req.params.phone;
// 	const image = req.body.image;
// 	const caption = req.body.caption;

// 	if (phone === undefined || image === undefined) {
// 		res.send({
// 			status: "error",
// 			message: "please enter valid phone and base64/url of image",
// 		});
// 	} else {
// 		if (base64regex.test(image)) {
// 			const media = new MessageMedia("image/png", image);
// 			global.client
// 				.sendMessage(`${phone}@c.us`, media, { caption: caption || "" })
// 				.then((response) => {
// 					if (response.id.fromMe) {
// 						res.send({
// 							status: "success",
// 							message: `MediaMessage successfully sent to ${phone}`,
// 						});
// 					}
// 				});
// 		} else if (vuri.isWebUri(image)) {
// 			if (!fs.existsSync("./temp")) {
// 				await fs.mkdirSync("./temp");
// 			}

// 			const path = `./temp/${image.split("/").slice(-1)[0]}`;
// 			mediadownloader(image, path, () => {
// 				const media = MessageMedia.fromFilePath(path);

// 				global.client
// 					.sendMessage(`${phone}@c.us`, media, { caption: caption || "" })
// 					.then((response) => {
// 						if (response.id.fromMe) {
// 							res.send({
// 								status: "success",
// 								message: `MediaMessage successfully sent to ${phone}`,
// 							});
// 							fs.unlinkSync(path);
// 						}
// 					});
// 			});
// 		} else {
// 			res.send({
// 				status: "error",
// 				message: "Invalid URL/Base64 Encoded Media",
// 			});
// 		}
// 	}
// });

// router.post("/sendpdf/:phone", async (req, res) => {
// 	const base64regex =
// 		/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

// 	const phone = req.params.phone;
// 	const pdf = req.body.pdf;

// 	if (phone === undefined || pdf === undefined) {
// 		res.send({
// 			status: "error",
// 			message: "please enter valid phone and base64/url of pdf",
// 		});
// 	} else {
// 		if (base64regex.test(pdf)) {
// 			let media = new MessageMedia("application/pdf", pdf);
// 			global.client.sendMessage(`${phone}@c.us`, media).then((response) => {
// 				if (response.id.fromMe) {
// 					res.send({
// 						status: "success",
// 						message: `MediaMessage successfully sent to ${phone}`,
// 					});
// 				}
// 			});
// 		} else if (vuri.isWebUri(pdf)) {
// 			if (!fs.existsSync("./temp")) {
// 				await fs.mkdirSync("./temp");
// 			}

// 			var path = "./temp/" + pdf.split("/").slice(-1)[0];
// 			mediadownloader(pdf, path, () => {
// 				let media = MessageMedia.fromFilePath(path);
// 				global.client.sendMessage(`${phone}@c.us`, media).then((response) => {
// 					if (response.id.fromMe) {
// 						res.send({
// 							status: "success",
// 							message: `MediaMessage successfully sent to ${phone}`,
// 						});
// 						fs.unlinkSync(path);
// 					}
// 				});
// 			});
// 		} else {
// 			res.send({
// 				status: "error",
// 				message: "Invalid URL/Base64 Encoded Media",
// 			});
// 		}
// 	}
// });

module.exports = router;
