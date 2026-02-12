import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
