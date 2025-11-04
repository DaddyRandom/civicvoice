import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('community_members', (table) => {
    table.uuid('member_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('community_id').notNullable().references('community_id').inTable('communities').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['member', 'moderator', 'admin']).defaultTo('member');
    table.timestamp('joined_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('community_id');
    table.index('user_id');

    // Unique constraint
    table.unique(['community_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('community_members');
}
