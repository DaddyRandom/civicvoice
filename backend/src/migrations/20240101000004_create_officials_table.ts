import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('officials', (table) => {
    table.uuid('official_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('title', 100).notNullable();
    table.string('party', 50).nullable();
    table.enum('level', ['federal', 'state', 'local']).notNullable();
    table.string('office_type', 100).notNullable(); // senator, representative, mayor, etc.
    table.string('contact_email', 255).nullable();
    table.string('contact_phone', 20).nullable();
    table.string('office_address', 500).nullable();
    table.string('district', 100).nullable();
    table.string('state', 2).nullable();
    table.string('photo_url', 500).nullable();
    table.text('bio').nullable();
    table.jsonb('jurisdiction_data').nullable();
    table.string('external_id', 255).nullable(); // ID from external APIs
    table.string('website_url', 500).nullable();
    table.jsonb('social_media').nullable();
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('level');
    table.index('state');
    table.index('office_type');
    table.index('external_id');
    table.index('active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('officials');
}
