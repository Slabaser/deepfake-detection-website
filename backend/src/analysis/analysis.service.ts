import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analysis } from './schemas/analysis.schema';
import axios from 'axios';
import * as path from 'path';

interface AIResponse {
  finalVerdict: string;
  finalConfidence: number;
  finalProbabilities: { fake: number; real: number };
  totalInferenceTime: number;
  modelResults: Record<string, unknown>;
}

@Injectable()
export class AnalysisService {
  private readonly AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    @InjectModel(Analysis.name) private analysisModel: Model<Analysis>,
  ) {}

  async createAnalysis(userId: string, filename: string): Promise<Analysis> {
    const newAnalysis = new this.analysisModel({
      userId,
      imageUrl: filename,
      verdict: 'PENDING',
      confidence: 0,
      modelUsed: 'Ensemble (4 Model)',
    });

    const saved = await newAnalysis.save();

    this.analyzeWithAI(saved._id.toString(), filename);

    return saved;
  }

  private async analyzeWithAI(analysisId: string, filename: string) {
    try {
      const imagePath = path.join(process.cwd(), 'uploads', filename);

      console.log(`🔍 AI analizi başlatılıyor: ${filename}`);

      const response = await axios.post<AIResponse>(
        `${this.AI_SERVICE_URL}/analyze-path`,
        { imagePath },
        { timeout: 60000 },
      );

      const {
        finalVerdict,
        finalConfidence,
        finalProbabilities,
        totalInferenceTime,
        modelResults,
      } = response.data;

      await this.analysisModel.findByIdAndUpdate(analysisId, {
        verdict: finalVerdict,
        confidence: finalConfidence,
        modelUsed: 'Ensemble (Xception, ResNet50, EfficientNet-B4, CLIP)',
        inferenceTime: totalInferenceTime,
        modelResults: modelResults,
        finalProbabilities: finalProbabilities,
      });

      console.log(
        `✅ Analiz tamamlandı: ${analysisId} - ${finalVerdict} (${finalConfidence}%)`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('❌ AI Servis hatası:', errorMessage);

      await this.analysisModel.findByIdAndUpdate(analysisId, {
        verdict: 'ERROR',
        modelUsed: 'Hata oluştu',
      });
    }
  }

  async getUserHistory(userId: string): Promise<Analysis[]> {
    return this.analysisModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getAnalysisById(analysisId: string): Promise<Analysis> {
    const analysis = await this.analysisModel.findById(analysisId);
    if (!analysis) {
      throw new NotFoundException('Analiz bulunamadı');
    }
    return analysis;
  }
}
