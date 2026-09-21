import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: './prisma/schema.prisma',
    db: {
      // マイグレーション/DDL はセッション対応接続が必要なため DIRECT_URL（session pooler）を使う
      connection: process.env['DIRECT_URL']!,
    },
  }),
});
