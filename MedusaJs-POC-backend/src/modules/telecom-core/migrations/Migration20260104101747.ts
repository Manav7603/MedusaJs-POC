import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260104101747 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "msisdn_inventory" drop constraint if exists "msisdn_inventory_phone_number_unique";`);
    this.addSql(`create table if not exists "msisdn_inventory" ("id" text not null, "phone_number" text not null, "status" text check ("status" in ('available', 'reserved', 'active', 'cooling_down')) not null, "tier" text check ("tier" in ('standard', 'gold', 'platinum')) not null, "region_code" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "msisdn_inventory_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_msisdn_inventory_phone_number_unique" ON "msisdn_inventory" ("phone_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_msisdn_inventory_deleted_at" ON "msisdn_inventory" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "plan_configuration" ("id" text not null, "product_id" text not null, "type" text check ("type" in ('prepaid', 'postpaid')) not null, "data_quota_mb" integer not null, "voice_quota_min" integer not null, "contract_months" integer not null, "is_5g" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "plan_configuration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_plan_configuration_deleted_at" ON "plan_configuration" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "subscription" ("id" text not null, "customer_id" text not null, "status" text check ("status" in ('active', 'suspended', 'barred')) not null, "msisdn_id" text not null, "current_period_start" timestamptz not null, "renewal_date" timestamptz not null, "billing_day" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_deleted_at" ON "subscription" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "usage_counter" ("id" text not null, "subscription_id" text not null, "cycle_month" text not null, "data_used" integer not null default 0, "voice_used" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "usage_counter_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_usage_counter_deleted_at" ON "usage_counter" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "msisdn_inventory" cascade;`);

    this.addSql(`drop table if exists "plan_configuration" cascade;`);

    this.addSql(`drop table if exists "subscription" cascade;`);

    this.addSql(`drop table if exists "usage_counter" cascade;`);
  }

}
