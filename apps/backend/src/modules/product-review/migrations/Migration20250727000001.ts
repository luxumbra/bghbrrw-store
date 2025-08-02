import { Migration } from '@mikro-orm/migrations';

export class Migration20250727000001 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "review" ("id" varchar(255) not null, "title" varchar(255) null, "content" text not null, "rating" real not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "status" text check ("status" in (\'pending\', \'approved\', \'rejected\')) not null default \'pending\', "product_id" varchar(255) not null, "customer_id" varchar(255) null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));');
    this.addSql('create index "IDX_REVIEW_PRODUCT_ID" on "review" ("product_id");');
    this.addSql('alter table "review" add constraint "rating_range" check (rating >= 1 AND rating <= 5);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "review" cascade;');
  }

}