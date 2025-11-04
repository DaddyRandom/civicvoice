import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 20).nullable();
    table.string('password_hash', 255).notNullable();
    table.boolean('twofa_enabled').defaultTo(false);
    table.string('twofa_secret', 255).nullable();
    table.boolean('voter_registration_verified').defaultTo(false);
    table.string('verification_state', 2).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('voter_registration_verified');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
