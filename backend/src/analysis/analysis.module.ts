import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Analysis, AnalysisSchema } from './schemas/analysis.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analysis.name, schema: AnalysisSchema },
    ]),
  ],
  providers: [AnalysisService],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
