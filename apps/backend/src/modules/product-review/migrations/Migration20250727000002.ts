import { Migration } from '@mikro-orm/migrations';

export class Migration20250727000002 extends Migration {

  async up(): Promise<void> {
    // Add deleted_at column and timestamp columns if they don't exist
    this.addSql('alter table "review" add column if not exists "deleted_at" timestamptz null;');
    
    // Update existing records to have proper timestamps if they don't exist
    this.addSql('update "review" set "created_at" = now() where "created_at" is null;');
    this.addSql('update "review" set "updated_at" = now() where "updated_at" is null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "review" drop column if exists "deleted_at";');
  }

}