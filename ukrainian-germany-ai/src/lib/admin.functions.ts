import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { siteContentSchema, manageUserSchema, assertManageUser } from './site-content';

export const getAdminAccess = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  return { admin: !error && data === true };
});

export const getAdminDashboard = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ page: z.number().int().min(1).max(100000) }).strict().parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || !allowed) throw new Error('ADMIN_FORBIDDEN');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [users, letters, blocks, roles] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: data.page, perPage: 50 }),
      supabaseAdmin.from('letters').select('id', { head: true, count: 'exact' }),
      context.supabase.from('site_content').select('*').order('position').order('updated_at'),
      context.supabase.from('user_roles').select('user_id').eq('role', 'admin'),
    ]);
    if (users.error || letters.error || blocks.error || roles.error) throw new Error('ADMIN_LOAD_FAILED');
    const admins = new Set((roles.data ?? []).map(r => r.user_id));
    // Project-wide count is returned by the Auth API, not the length of this page.
    const totals = users.data as typeof users.data & { total?: number; lastPage?: number };
    return { total: totals.total ?? 0, lastPage: totals.lastPage ?? 1, letters: letters.count ?? 0, content: blocks.data ?? [],
      users: users.data.users.map(u => ({ id: u.id, email: u.email ?? '', createdAt: u.created_at, lastSignIn: u.last_sign_in_at ?? null,
        blocked: Boolean(u.banned_until && Date.parse(u.banned_until) > Date.now()), protected: u.id === context.userId || admins.has(u.id) })) };
  });

export const saveSiteContent = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => siteContentSchema.parse(input)).handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (error || !allowed) throw new Error('ADMIN_FORBIDDEN');
    const { id, ...fields } = data;
    const values = { ...fields, ...(id ? { id } : {}), updated_at: new Date().toISOString() };
    const result = data.id
      ? await context.supabase.from('site_content').update(values).eq('id', data.id).select('id').single()
      : await context.supabase.from('site_content').upsert(values, { onConflict: data.kind === 'override' ? 'slot' : 'id' }).select('id').single();
    if (result.error) throw new Error('ADMIN_SAVE_FAILED');
    return { id: result.data.id };
  });

export const deleteSiteContent = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.uuid() }).strict().parse(input)).handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (error || !allowed) throw new Error('ADMIN_FORBIDDEN');
    const result = await context.supabase.from('site_content').delete().eq('id', data.id);
    if (result.error) throw new Error('ADMIN_SAVE_FAILED');
    return { ok: true };
  });

export const manageAdminUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => manageUserSchema.parse(input)).handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (error || !allowed) throw new Error('ADMIN_FORBIDDEN');
    const target = await context.supabase.rpc('has_role', { _user_id: data.userId, _role: 'admin' });
    if (target.error) throw new Error('ADMIN_FORBIDDEN');
    assertManageUser(context.userId, data.userId, target.data === true);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: data.blocked ? '876000h' : 'none' });
    if (result.error) throw new Error('ADMIN_SAVE_FAILED');
    return { ok: true };
  });
