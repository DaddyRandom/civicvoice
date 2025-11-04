import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('letters', (table) => {
    table.uuid('letter_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.uuid('official_id').notNullable().references('official_id').inTable('officials').onDelete('RESTRICT');
    table.string('subject', 500).notNullable();
    table.text('body').notNullable();
    table.enum('letter_type', ['letter', 'memo']).defaultTo('letter');
    table.string('issue_category', 100).nullable();
    table.enum('seal_type', ['state', 'federal', 'none']).nullable();
    table.enum('status', ['draft', 'sent', 'delivered', 'responded']).defaultTo('draft');
    table.enum('visibility', ['private', 'community', 'public']).defaultTo('private');
    table.string('pdf_url', 500).nullable();
    table.integer('view_count').defaultTo(0);
    table.integer('use_count').defaultTo(0); // Number of times used as template
    table.timestamp('sent_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('responded_at').nullable();
    table.text('response_text').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('official_id');
    table.index('status');
    table.index('visibility');
    table.index('issue_category');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('letters');
}
