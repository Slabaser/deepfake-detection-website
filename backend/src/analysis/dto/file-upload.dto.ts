import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Analiz edilecek görsel dosyası',
  })
  image: any;
}
