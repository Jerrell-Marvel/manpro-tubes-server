import multer from "multer";
import path from "path";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";

export const fileUpload = (destination) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
  });

  const imageFileFilter = (req, file, cb) => {
    if (req.product) {
      const productImagesCount = req.product.images.length;

      if (req.files.length + productImagesCount > 12) {
        cb(new BadRequestError("maximum image exceeded"));
      }
    }
    const filetypes = /jpeg|jpg|png/i;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new BadRequestError("invalid file type"));
  };

  const limits = {
    fileSize: 1024 * 1024 * 3,
  };

  const upload = multer({ storage, fileFilter: imageFileFilter, limits });

  return upload;
};
