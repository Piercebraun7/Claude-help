import { supabase } from './supabase';

// Every function in this file must only call .select(). See CLAUDE.md.

export async function getMyResidentProfile() {
  const { data, error } = await supabase
    .from('resident_profiles')
    .select('id, user_id, unit_id, property_id, contact_email, contact_phone, units(unit_number), properties(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function getResidentContext(propertyId, unitId) {
  const [{ data: property, error: propertyError }, { data: unit, error: unitError }] = await Promise.all([
    supabase.from('properties').select('id, name, address, service_schedule').eq('id', propertyId).single(),
    supabase.from('units').select('id, unit_number, status, strike_count').eq('id', unitId).single(),
  ]);
  if (propertyError) throw propertyError;
  if (unitError) throw unitError;
  return { property, unit };
}

export async function listUnitIssues(unitId) {
  const { data, error } = await supabase
    .from('issues')
    .select('id, title, description, image_url, status, created_at, loose_trash, cardboard, unserviceable, can_present')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listResidentServiceRequests(userId) {
  const { data, error } = await supabase
    .from('resident_service_requests')
    .select('id, status, request_type, description, preferred_service_date, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listNotificationActivity(userId) {
  const { data, error } = await supabase
    .from('resident_notification_activity')
    .select('id, activity_type, event_type, channel, status, detail, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function getNotificationSettings(userId) {
  const { data, error } = await supabase
    .from('resident_notification_settings')
    .select('email_enabled, flag_alerts_enabled, schedule_reminders_enabled, ad_hoc_updates_enabled, quiet_hours')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listFaqs(propertyId) {
  const { data, error } = await supabase
    .from('resident_faqs')
    .select('id, question, answer, tags, audience')
    .or(`property_id.eq.${propertyId},property_id.is.null`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
