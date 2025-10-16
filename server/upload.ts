import type { Express } from "express";
import multer from "multer";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

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

      const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      const publicDir = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(',')[0];
      
      if (!bucket || !publicDir) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      // Generate unique filename
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filename = `${randomBytes(16).toString('hex')}.${ext}`;
      const filepath = join(publicDir, filename);

      // Write file to object storage
      await writeFile(filepath, req.file.buffer);

      // Return public URL
      const url = `/public/${filename}`;
      res.json({ url });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });
}
