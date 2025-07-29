import { Migration } from '@mikro-orm/migrations';

export class Migration20250727000004 extends Migration {

  async up(): Promise<void> {
    // Create review_collection_link table for many-to-many relationship
    this.addSql('create table if not exists "review_collection_link" ("id" varchar(255) not null, "review_id" varchar(255) not null, "collection_id" varchar(255) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_collection_link_pkey" primary key ("id"));');
    this.addSql('create index if not exists "IDX_REVIEW_COLLECTION_LINK_REVIEW" on "review_collection_link" ("review_id");');
    this.addSql('create index if not exists "IDX_REVIEW_COLLECTION_LINK_COLLECTION" on "review_collection_link" ("collection_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "review_collection_link" cascade;');
  }

}