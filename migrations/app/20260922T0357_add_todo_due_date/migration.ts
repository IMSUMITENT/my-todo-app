#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a3295138133ecb40fddf683846a786cdaef10ca5721c7f16f39cb7a8ba010895/contract';
import endContract from '../../snapshots/a3295138133ecb40fddf683846a786cdaef10ca5721c7f16f39cb7a8ba010895/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c0482808867847390f25767c7f1890f7b97acace15919ce7791b5afbdf35f5b0/contract';
import startContract from '../../snapshots/c0482808867847390f25767c7f1890f7b97acace15919ce7791b5afbdf35f5b0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'todos',
        column: col('due_date', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
