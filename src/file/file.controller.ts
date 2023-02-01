import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileService } from './file.service';
import * as config from 'config';
import { dynamicPathMulterOptionsHelper } from 'src/common/helper/dynamic-path-multer-options.helper';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteAssetDto } from './dto/delete-asset.dto';
const appConfig = config.get('app');

@ApiTags('File')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('file')
export class FileController {
  publicFolderPath: string;
  constructor(private readonly service: FileService) {}

  @Get()
  getAllFile() {
    return this.service.getFiles();
  }

  @Post('/folder/create')
  createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.service.createFolder(createFolderDto);
  }

  @UseInterceptors(
    FilesInterceptor(
      'files',
      null,
      dynamicPathMulterOptionsHelper(1000000, true)
    )
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload files',
    type: UploadFileDto
  })
  @Post()
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return files.map(
      (file) => `${appConfig.appUrl}/images/service/${file.filename}`
    );
  }

  @Delete('/:type/delete')
  removeFileOrFolder(
    @Body() deleteAssetDto: DeleteAssetDto,
    @Param('type') assetType: string
  ) {
    return this.service.deleteAsset(assetType, deleteAssetDto);
  }
}
