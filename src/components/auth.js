const router = require("express").Router();

router.get("/checkauth", async (req, res) => {
	try {
		const data = await global.client.getState();
		if (data) {
			return res.json({
				success: true,
				status: "authenticated",
				data,
				error: null,
			});
		}
		res.json({
			success: false,
			status: "no_auth",
			data: null,
			error: "No Auth Found",
		});
	} catch (error) {
		console.error("Error fetching auth state:", error);
		res.json({
			success: false,
			status: "disconnected",
			data: null,
			error: "DISCONNECTED",
		});
	}
});

router.get("/getqrhtml", async (req, res) => {
	await handleQrRequest(res, "html");
});

router.get("/getqrjson", async (req, res) => {
	await handleQrRequest(res, "json");
});

async function handleQrRequest(res, mode) {
	try {
		const data = await global.client.getState();
		if (data) {
			return res.json({
				success: true,
				status: "authenticated",
				data: null,
				error: "Already Authenticated",
			});
		}
		sendQr(res, mode);
	} catch (error) {
		console.error("Error fetching QR state:", error);
		sendQr(res, mode);
	}
}

function sendQr(res, mode = "html") {
	const last_qr = global.qr;

	if (last_qr) {
		if (mode === "html") {
			const page = `
				<html>
				<body>
					<img style='display:block; width:400px;height:400px;' src='${last_qr}' />
				</body>
				</html>
			`;
			res.write(page);
		} else if (mode === "json") {
			res.json({
				success: true,
				status: "qr_generated",
				data: { qr: last_qr },
				error: null,
			});
		} else {
			res.status(400).json({
				success: false,
				status: "invalid_mode",
				data: null,
				error: "Invalid Mode",
			});
		}
	} else {
		if (mode === "html") {
			res.status(404).json({
				success: false,
				status: "no_qr",
				data: null,
				error: "No QR Code Found",
			});
		} else if (mode === "json") {
			res.json({
				success: false,
				status: "no_qr",
				data: null,
				error: "No QR Code Found",
			});
		} else {
			res.status(400).json({
				success: false,
				status: "invalid_mode",
				data: null,
				error: "Invalid Mode",
			});
		}
	}
	res.end();
}

module.exports = router;
