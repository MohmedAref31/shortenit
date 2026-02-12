import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './models/url.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }])],
})
export class UrlModule {}
