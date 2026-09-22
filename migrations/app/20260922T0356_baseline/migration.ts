#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c0482808867847390f25767c7f1890f7b97acace15919ce7791b5afbdf35f5b0/contract';
import endContract from '../../snapshots/c0482808867847390f25767c7f1890f7b97acace15919ce7791b5afbdf35f5b0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'todos',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('is_completed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.enableRowLevelSecurity({ schema: 'public', table: 'todos' }),
      this.createRlsPolicy({
        schema: 'public',
        table: 'todos',
        policy: {
          naming: { kind: 'exact', name: 'Users can delete their own todos' },
          tableName: 'todos',
          namespaceId: 'public',
          operation: 'delete',
          roles: ['authenticated'],
          using: '(auth.uid() = user_id)',
          permissive: true,
        },
      }),
      this.createRlsPolicy({
        schema: 'public',
        table: 'todos',
        policy: {
          naming: { kind: 'exact', name: 'Users can insert their own todos' },
          tableName: 'todos',
          namespaceId: 'public',
          operation: 'insert',
          roles: ['authenticated'],
          withCheck: '(auth.uid() = user_id)',
          permissive: true,
        },
      }),
      this.createRlsPolicy({
        schema: 'public',
        table: 'todos',
        policy: {
          naming: { kind: 'exact', name: 'Users can update their own todos' },
          tableName: 'todos',
          namespaceId: 'public',
          operation: 'update',
          roles: ['authenticated'],
          using: '(auth.uid() = user_id)',
          withCheck: '(auth.uid() = user_id)',
          permissive: true,
        },
      }),
      this.createRlsPolicy({
        schema: 'public',
        table: 'todos',
        policy: {
          naming: { kind: 'exact', name: 'Users can view their own todos' },
          tableName: 'todos',
          namespaceId: 'public',
          operation: 'select',
          roles: ['authenticated'],
          using: '(auth.uid() = user_id)',
          permissive: true,
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
