import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgTrgm1732828800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable pg_trgm extension
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');

        // Create indexes for faster fuzzy search
        await queryRunner.query(
            'CREATE INDEX IF NOT EXISTS idx_user_name_trgm ON "User" USING GIN (name gin_trgm_ops)',
        );
        await queryRunner.query(
            'CREATE INDEX IF NOT EXISTS idx_user_email_trgm ON "User" USING GIN (email gin_trgm_ops)',
        );
        await queryRunner.query(
            'CREATE INDEX IF NOT EXISTS idx_user_username_trgm ON "User" USING GIN (username gin_trgm_ops)',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_username_trgm');
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_email_trgm');
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_name_trgm');

        // Disable pg_trgm extension
        await queryRunner.query('DROP EXTENSION IF EXISTS pg_trgm');
    }
}
