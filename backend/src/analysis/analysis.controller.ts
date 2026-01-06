import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AnalysisService } from './analysis.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Görsel yükle ve analiz sürecini başlat' })
  @ApiResponse({ status: 201, description: 'Dosya başarıyla yüklendi.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Sadece görsel dosyaları yüklenebilir!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Lütfen bir görsel seçin.');
    }

    const analysisRecord = await this.analysisService.createAnalysis(
      req.user.userId,
      file.filename,
    );

    return {
      message: 'Dosya başarıyla yüklendi ve analiz başlatıldı.',
      analysisId: analysisRecord._id,
      fileName: file.filename,
      status: analysisRecord.verdict,
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kullanıcının geçmiş taramalarını listeler' })
  async getHistory(@Req() req: RequestWithUser) {
    return this.analysisService.getUserHistory(req.user.userId);
  }

  @Get('uploads/:filename')
  @ApiOperation({ summary: 'Yüklenen görsel dosyasını getirir' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Görsel bulunamadı' });
    }
    
    return res.sendFile(filePath);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Belirli bir analizin detaylarını getirir' })
  async getAnalysis(@Param('id') id: string) {
    return this.analysisService.getAnalysisById(id);
  }
}
