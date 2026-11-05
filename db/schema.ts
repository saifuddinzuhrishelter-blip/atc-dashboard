import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
  id: text('id').primaryKey(), userId: text('user_id').unique(), email: text('email').notNull().unique(),
  name: text('name').notNull(), division: text('division').notNull().default('all'), role: text('role').notNull().default('member'),
  active: integer('active').notNull().default(1), createdAt: text('created_at').notNull(),
});
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), division: text('division').notNull(), title: text('title').notNull(),
  description: text('description').notNull().default(''), pic: text('pic').notNull(), dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('todo'), priority: text('priority').notNull().default('normal'),
  progress: integer('progress').notNull().default(0), link: text('link').notNull().default(''),
  archived: integer('archived').notNull().default(0), version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull(), updatedBy: text('updated_by').notNull(),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, t => [index('tasks_division_due_idx').on(t.division, t.dueDate)]);
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(), taskId: text('task_id').notNull().references(() => tasks.id), body: text('body').notNull(),
  authorId: text('author_id').notNull(), authorName: text('author_name').notNull(), createdAt: text('created_at').notNull(),
}, t => [index('comments_task_idx').on(t.taskId)]);
export const events = sqliteTable('events', {
  id: text('id').primaryKey(), taskId: text('task_id'), division: text('division').notNull().default('all'),
  action: text('action').notNull(), title: text('title').notNull(), actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(), details: text('details').notNull().default(''), createdAt: text('created_at').notNull(),
});
