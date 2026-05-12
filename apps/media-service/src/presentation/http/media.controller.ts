import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadFileCommand } from '../../application/use-cases/upload-file/upload-file.command';
import { UploadFileUseCase } from '../../application/use-cases/upload-file/upload-file.use-case';
import { GetFileMetadataQuery } from '../../application/use-cases/get-file-metadata/get-file-metadata.query';
import { GetFileMetadataUseCase } from '../../application/use-cases/get-file-metadata/get-file-metadata.use-case';
import { GetPresignedUrlQuery } from '../../application/use-cases/get-presigned-url/get-presigned-url.query';
import { GetPresignedUrlUseCase } from '../../application/use-cases/get-presigned-url/get-presigned-url.use-case';
import { DeleteFileCommand } from '../../application/use-cases/delete-file/delete-file.command';
import { DeleteFileUseCase } from '../../application/use-cases/delete-file/delete-file.use-case';
import { ListFilesQuery } from '../../application/use-cases/list-files/list-files.query';
import { ListFilesUseCase } from '../../application/use-cases/list-files/list-files.use-case';
import {
  FileObjectResponseDto,
  PaginatedFileObjectsResponseDto,
} from '../dtos/file-object.response.dto';
import { PresignedUrlResponseDto } from '../dtos/presigned-url.response.dto';
import { ListFilesQueryDto } from '../dtos/list-files.query.dto';

@ApiTags('Media')
@Controller('media/files')
export class MediaController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getFileMetadataUseCase: GetFileMetadataUseCase,
    private readonly getPresignedUrlUseCase: GetPresignedUrlUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly listFilesUseCase: ListFilesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file to Azure Blob Storage' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Injected by Kong after JWT validation',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-id') uploadedById: string,
  ): Promise<FileObjectResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadFileUseCase.execute(
      new UploadFileCommand(
        file.buffer,
        file.originalname,
        file.mimetype,
        file.size,
        uploadedById,
      ),
    );

    return FileObjectResponseDto.fromResult(result);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files with optional filters' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Injected by Kong after JWT validation',
  })
  async listFiles(
    @Query() query: ListFilesQueryDto,
  ): Promise<PaginatedFileObjectsResponseDto> {
    const result = await this.listFilesUseCase.execute(
      new ListFilesQuery(
        query.page,
        query.size,
        query.uploadedById,
        query.mimeType,
      ),
    );
    return PaginatedFileObjectsResponseDto.fromResult(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  async getFileMetadata(
    @Param('id') id: string,
  ): Promise<FileObjectResponseDto> {
    const result = await this.getFileMetadataUseCase.execute(
      new GetFileMetadataQuery(id),
    );
    return FileObjectResponseDto.fromResult(result);
  }

  @Get(':id/url')
  @ApiOperation({
    summary: 'Get a presigned download URL for a file (expires in 1 hour)',
  })
  async getPresignedUrl(
    @Param('id') id: string,
  ): Promise<PresignedUrlResponseDto> {
    const result = await this.getPresignedUrlUseCase.execute(
      new GetPresignedUrlQuery(id),
    );
    return PresignedUrlResponseDto.fromResult(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file from storage and database' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Injected by Kong after JWT validation',
  })
  async deleteFile(
    @Param('id') id: string,
    @Headers('x-user-id') deletedById: string,
  ): Promise<void> {
    await this.deleteFileUseCase.execute(
      new DeleteFileCommand(id, deletedById),
    );
  }
}
