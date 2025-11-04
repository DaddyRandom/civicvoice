import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('communities', (table) => {
    table.uuid('community_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.enum('community_type', ['district', 'state', 'local', 'issue']).notNullable();
    table.jsonb('jurisdiction_data').nullable();
    table.integer('member_count').defaultTo(0);
    table.string('image_url', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('community_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('communities');
}
