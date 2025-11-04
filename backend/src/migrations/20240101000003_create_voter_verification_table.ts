import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('voter_verification', (table) => {
    table.uuid('verification_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.date('date_of_birth').notNullable();
    table.string('registration_address', 500).notNullable();
    table.enum('verification_status', ['pending', 'verified', 'rejected', 'needs_review']).defaultTo('pending');
    table.timestamp('verification_date').nullable();
    table.jsonb('state_api_response').nullable();
    table.decimal('confidence_score', 5, 2).nullable();
    table.text('rejection_reason').nullable();
    table.string('verification_method', 50).nullable(); // 'state_api', 'manual', 'id_verification'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('verification_status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('voter_verification');
}
