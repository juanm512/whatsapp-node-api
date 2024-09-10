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

router.get("/getqr", async (req, res) => {
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
		sendQr(res);
	} catch (error) {
		console.error("Error fetching QR state:", error);
		sendQr(res);
	}
});

function sendQr(res) {
	const last_qr = global.qr;

	if (last_qr) {
		res.json({
			success: true,
			status: "qr_generated",
			data: { qr: last_qr },
			error: null,
		});
	} else {
		res.json({
			success: false,
			status: "no_qr",
			data: null,
			error: "No QR Code Found",
		});
	}
	res.end();
}

module.exports = router;
