import { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

export const uploadToCloudinary: RequestHandler = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_URL) return res.status(500).json({ error: "Cloudinary not configured" });
    const { image, filename } = req.body as { image?: string; filename?: string };
    if (!image) return res.status(400).json({ error: "missing image base64 data" });

    // image is expected as data URL or base64 string
    const result = await cloudinary.uploader.upload(image, { public_id: filename, folder: "promohive/uploads" });
    return res.status(200).json({ url: result.secure_url, raw: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};
