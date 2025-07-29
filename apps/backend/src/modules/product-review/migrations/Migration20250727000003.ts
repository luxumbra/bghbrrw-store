import { Migration } from '@mikro-orm/migrations';

export class Migration20250727000003 extends Migration {

  async up(): Promise<void> {
    // Add collection_id column for hybrid review strategy
    this.addSql('alter table "review" add column if not exists "collection_id" varchar(255) null;');
    this.addSql('create index if not exists "IDX_REVIEW_COLLECTION_ID" on "review" ("collection_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_REVIEW_COLLECTION_ID";');
    this.addSql('alter table "review" drop column if exists "collection_id";');
  }

}