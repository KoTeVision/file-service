const express = require("express");
const s3Service = require("../services/S3Service");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileController = express.Router();

const multipart = multer({ storage: multer.memoryStorage() });

fileController.post("/start-upload-stream", async (req, res) => {
  try {
    const { fileExtension } = req.body;

    const fileName = uuidv4();

    const filePath = `${fileName}.${fileExtension}`;

    const response = await s3Service.createUploadStream(filePath);

    if (response === null) throw new Error("Stream not created!");

    res.json({ filePath, streamUuid: response });
  } catch (e) {
    console.error("FileController error :>> ", e);
    res.status(400).json({ error: "Stream not created!" });
  }
});

fileController.post(
  "/upload-part",
  multipart.single("file"),
  async (req, res) => {
    try {
      const chunk = req.file.buffer;

      const { filePath, streamUuid, partNumber } = req.body;

      const response = await s3Service.uploadPart(
        streamUuid,
        filePath,
        chunk,
        Number(partNumber)
      );

      if (response === null) throw new Error("Chunk not upload!");

      res.status(200).json(response);
    } catch (e) {
      console.error("FileController error :>> ", e);
      res.status(400).json({ error: "Chunk not upload!" });
    }
  }
);

fileController.post("/finish-upload-stream", async (req, res) => {
  try {
    const { filePath, streamUuid, chunkMap } = req.body;

    const response = await s3Service.completeUpload(
      streamUuid,
      filePath,
      chunkMap
    );

    if (response === null) throw new Error("Chunk not upload!");

    res.status(200).json({ status: "ok", filePath: response.filePath });
  } catch (e) {
    console.error("FileController error :>> ", e);
    res.status(400).json({ error: "Chunk not upload!" });
  }
});

module.exports = fileController;
