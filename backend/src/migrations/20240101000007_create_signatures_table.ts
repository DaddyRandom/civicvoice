import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('signatures', (table) => {
    table.uuid('signature_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('petition_id').notNullable().references('petition_id').inTable('petitions').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.timestamp('signed_at').defaultTo(knex.fn.now());
    table.string('ip_address', 45).nullable();
    table.boolean('verified').defaultTo(false);
    table.text('comment').nullable(); // Optional comment with signature
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('petition_id');
    table.index('user_id');
    table.index('signed_at');

    // Unique constraint: one signature per user per petition
    table.unique(['petition_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('signatures');
}
