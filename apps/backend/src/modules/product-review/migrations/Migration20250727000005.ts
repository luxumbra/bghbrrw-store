import { Migration } from '@mikro-orm/migrations';

export class Migration20250727000005 extends Migration {

  async up(): Promise<void> {
    // Add order_id column for purchase validation (nullable first, then update)
    this.addSql('alter table "review" add column if not exists "order_id" varchar(255) null;');
    
    // Set a default order_id for existing reviews (we'll use a placeholder)
    this.addSql('update "review" set "order_id" = \'legacy-\' || "id" where "order_id" is null;');
    
    // Now make it not null
    this.addSql('alter table "review" alter column "order_id" set not null;');
    
    this.addSql('create index if not exists "IDX_REVIEW_ORDER_ID" on "review" ("order_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_REVIEW_ORDER_ID";');
    this.addSql('alter table "review" drop column if exists "order_id";');
  }

}