import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1746518400000 implements MigrationInterface {
  name = 'InitialSchema1746518400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM('admin', 'super_admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "users_status_enum" AS ENUM('active', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'admin',
        "status" "users_status_enum" NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_login_at" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "layouts" (
        "id" SERIAL NOT NULL,
        "slug" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        CONSTRAINT "UQ_layouts_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_layouts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "email_templates" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "layout_id" integer NOT NULL,
        "content_json" jsonb NOT NULL,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "send_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_email_templates" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_email_templates_name" ON "email_templates" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_templates_layout_id" ON "email_templates" ("layout_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_templates_created_by" ON "email_templates" ("created_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_templates_deleted_at" ON "email_templates" ("deleted_at")`,
    );

    await queryRunner.query(`
      CREATE TYPE "email_sends_status_enum" AS ENUM('queued', 'sent', 'failed')
    `);
    await queryRunner.query(`
      CREATE TABLE "email_sends" (
        "id" SERIAL NOT NULL,
        "template_id" integer,
        "sent_by" integer,
        "recipient_emails" text[] NOT NULL,
        "subject" character varying NOT NULL,
        "status" "email_sends_status_enum" NOT NULL DEFAULT 'queued',
        "sent_at" TIMESTAMP,
        "error_message" text,
        CONSTRAINT "PK_email_sends" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_email_sends_template_id" ON "email_sends" ("template_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_sends_sent_by" ON "email_sends" ("sent_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_sends_sent_at" ON "email_sends" ("sent_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "password_resets" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "used_at" TIMESTAMP,
        CONSTRAINT "PK_password_resets" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "email_templates"
        ADD CONSTRAINT "FK_email_templates_layout" FOREIGN KEY ("layout_id")
          REFERENCES "layouts"("id") ON DELETE RESTRICT,
        ADD CONSTRAINT "FK_email_templates_created_by" FOREIGN KEY ("created_by")
          REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "email_sends"
        ADD CONSTRAINT "FK_email_sends_template" FOREIGN KEY ("template_id")
          REFERENCES "email_templates"("id") ON DELETE SET NULL,
        ADD CONSTRAINT "FK_email_sends_sent_by" FOREIGN KEY ("sent_by")
          REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "password_resets"
        ADD CONSTRAINT "FK_password_resets_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_resets" DROP CONSTRAINT "FK_password_resets_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_sends" DROP CONSTRAINT "FK_email_sends_sent_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_sends" DROP CONSTRAINT "FK_email_sends_template"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_templates" DROP CONSTRAINT "FK_email_templates_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_templates" DROP CONSTRAINT "FK_email_templates_layout"`,
    );
    await queryRunner.query(`DROP TABLE "password_resets"`);
    await queryRunner.query(`DROP INDEX "IDX_email_sends_sent_at"`);
    await queryRunner.query(`DROP INDEX "IDX_email_sends_sent_by"`);
    await queryRunner.query(`DROP INDEX "IDX_email_sends_template_id"`);
    await queryRunner.query(`DROP TABLE "email_sends"`);
    await queryRunner.query(`DROP TYPE "email_sends_status_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_email_templates_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_email_templates_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_email_templates_layout_id"`);
    await queryRunner.query(`DROP INDEX "IDX_email_templates_name"`);
    await queryRunner.query(`DROP TABLE "email_templates"`);
    await queryRunner.query(`DROP TABLE "layouts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
