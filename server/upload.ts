import type { Express } from "express";
import multer from "multer";
import { randomBytes } from "crypto";
import { ObjectStorageService } from "./objectStorage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export function setupImageUpload(app: Express) {
  app.post("/api/upload-image", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Generate unique filename
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filename = `${randomBytes(16).toString('hex')}.${ext}`;

      // Upload to object storage
      const objectStorage = new ObjectStorageService();
      const url = await objectStorage.uploadFile(req.file.buffer, filename, req.file.mimetype);

      res.json({ url });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });
}
