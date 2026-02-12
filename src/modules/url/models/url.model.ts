import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/user/models/user.model';

export type UrlDocument = HydratedDocument<Url>;

@Schema()
export class Url {
  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
  })
  shortCode: string;

  @Prop({ required: true, trim: true })
  originalUrl: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop()
  expiresAt: Date;

  @Prop({ default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ default: 0 })
  clicksCount: number;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
