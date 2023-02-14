import { BadRequestException, Injectable } from '@nestjs/common';
import * as config from 'config';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  unlink,
  unlinkSync
} from 'fs';
import path = require('path');
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteAssetDto } from './dto/delete-asset.dto';
import { capitalize } from 'lodash';
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
    // if (!files.length) {
    const fileStat = statSync(filePath);
    fileJson[name] = {
      size: fileStat.size,
      type: fileStat.isDirectory() ? 'dir' : 'file',
      name: filePath.split(path.sep).pop()
    };
    // }
    const array = (fileJson[name]['folder_files'] = []);
    files.forEach((file) => {
      const fileStat = statSync(path.join(filePath, file));
      if (fileStat.isDirectory()) {
        this.generateFileJson(path.join(filePath, file), fileJson[name]);
      } else {
        this.getFilePath(filePath);
        array.push({
          size: fileStat.size,
          path: `${appConfig.appUrl}/${this.getFilePath(filePath)}/${file}`,
          type: 'file',
          name: file
        });
      }
    });

    return fileJson;
  }

  createFolder(createFolderDto: CreateFolderDto) {
    const destinationPath = path.join(
      'public',
      ...createFolderDto.destinationPath,
      createFolderDto.name
    );
    if (existsSync(destinationPath)) {
      return new BadRequestException('Folder is already exist.');
    }
    mkdirSync(destinationPath);
    return destinationPath;
  }

  deleteAsset(type: string, deleteAssetDto: DeleteAssetDto) {
    const destinationPath = path.join(
      'public',
      ...deleteAssetDto.destinationPath
    );
    if (!existsSync(destinationPath)) {
      throw new BadRequestException(`${capitalize(type)} not found.`);
    }
    if (type === 'folder') {
      return rmSync(destinationPath, { recursive: true, force: true });
    }
    if (type === 'file') {
      return unlinkSync(destinationPath);
    }
  }

  getFilePath(filePath: string) {
    if (filePath.split('public/').length > 1) {
      return filePath.split('public/').pop();
    }
    return '';
  }
}
