import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { readdirSync, statSync } from 'fs';
import path = require('path');
const appConfig = config.get('app');

@Injectable()
export class FileService {
  protected get publicPath() {
    return path.join(__dirname, '../../public');
  }

  getFiles() {
    return this.generateFileJson(this.publicPath);
  }

  private generateFileJson(filePath: string, fileJson = {}) {
    const name = filePath.split(path.sep).pop();
    fileJson[name] = {};
    const files = readdirSync(filePath);
    if (!files.length) {
      const fileStat = statSync(filePath);
      fileJson[name] = {
        size: fileStat.size,
        type: fileStat.isDirectory() ? 'dir' : 'file',
        name: filePath.split(path.sep).pop()
      };
    }
    files.forEach((file) => {
      const fileStat = statSync(path.join(filePath, file));
      if (fileStat.isDirectory()) {
        this.generateFileJson(path.join(filePath, file), fileJson[name]);
      } else {
        const array = (fileJson[name]['files'] = []);
        array.push({
          size: fileStat.size,
          path: `${appConfig.appUrl}/files/${file}`,
          type: 'file',
          name: file
        });
      }
    });

    return fileJson;
  }
}
