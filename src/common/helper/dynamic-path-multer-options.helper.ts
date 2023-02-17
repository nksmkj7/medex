import { HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { CustomHttpException } from 'src/exception/custom-http.exception';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import path = require('path');

export const dynamicPathMulterOptionsHelper = (
  maxFileSize: number,
  required = false
) => ({
  limits: {
    fileSize: +maxFileSize
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(
        new CustomHttpException(
          'unsupportedFileType',
          HttpStatus.BAD_REQUEST,
          StatusCodesList.UnsupportedFileType
        ),
        false
      );
    }
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const destinationPath = getDestinationPath(req.body.destinationPath);
      // Create folder if doesn't exist
      if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath);
      }
      cb(null, destinationPath);
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${uuid()}${extname(file.originalname)}`);
    }
  })
});

const getDestinationPath = (destinationMap) => {
  if (!destinationMap) return 'public';
  if (Array.isArray(destinationMap)) {
    return path.join('public', ...destinationMap);
  }
  return path.join('public', destinationMap);
};