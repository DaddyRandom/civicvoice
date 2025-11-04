import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('petitions', (table) => {
    table.uuid('petition_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('creator_user_id').notNullable().references('user_id').inTable('users').onDelete('RESTRICT');
    table.string('title', 500).notNullable();
    table.text('description').notNullable();
    table.specificType('target_officials', 'uuid[]').notNullable();
    table.integer('goal_signatures').notNullable();
    table.integer('current_signatures').defaultTo(0);
    table.enum('status', ['active', 'closed', 'delivered']).defaultTo('active');
    table.string('category', 100).nullable();
    table.integer('view_count').defaultTo(0);
    table.string('share_url', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('creator_user_id');
    table.index('status');
    table.index('category');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('petitions');
}
