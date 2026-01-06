import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Analysis extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: 'PENDING' })
  verdict: string;

  @Prop({ default: 0 })
  confidence: number;

  @Prop()
  modelUsed: string;

  @Prop()
  inferenceTime: number;

  @Prop({ type: Object })
  modelResults: {
    Xception: object;
    'EfficientNet-B4': object;
    ResNet50: object;
    CLIP: object;
  };

  @Prop({ type: Object })
  finalProbabilities: {
    fake: number;
    real: number;
  };
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
