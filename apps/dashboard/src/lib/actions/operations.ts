'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getDashboardContext } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/server';

async function requireWrite() {
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) {
    throw new Error('Insufficient permissions');
  }
  return ctx;
}

export async function createFarm(formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Name is required');

  const { data, error } = await supabase
    .from('farms')
    .insert({
      organization_id: ctx.organizationId,
      name,
      description: String(formData.get('description') ?? '') || null,
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
      total_area: formData.get('total_area') ? Number(formData.get('total_area')) : null,
      area_unit: (formData.get('area_unit') as string) || 'hectare',
      status: 'active',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/farms');
  redirect(`/farms/${data.id}/map`);
}

export async function updateFarm(id: string, formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const { error } = await supabase
    .from('farms')
    .update({
      name: String(formData.get('name') ?? '').trim(),
      description: String(formData.get('description') ?? '') || null,
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
      total_area: formData.get('total_area') ? Number(formData.get('total_area')) : null,
      area_unit: (formData.get('area_unit') as string) || 'hectare',
      status: (formData.get('status') as string) || 'active',
    })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/farms');
  revalidatePath(`/farms/${id}`);
  redirect(`/farms/${id}`);
}

export async function softDeleteFarm(id: string) {
  const ctx = await getDashboardContext();
  if (!ctx.canAdmin) throw new Error('Insufficient permissions');

  const supabase = await createClient();
  const { error } = await supabase
    .from('farms')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/farms');
  redirect('/farms');
}

export async function createField(formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const farmId = String(formData.get('farm_id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!farmId || !name) throw new Error('Farm and name are required');

  const { data, error } = await supabase
    .from('fields')
    .insert({
      organization_id: ctx.organizationId,
      farm_id: farmId,
      name,
      area: formData.get('area') ? Number(formData.get('area')) : null,
      soil_type: String(formData.get('soil_type') ?? '') || null,
      soil_ph: formData.get('soil_ph') ? Number(formData.get('soil_ph')) : null,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/fields');
  redirect(`/fields/${data.id}`);
}

export async function updateField(id: string, formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const { error } = await supabase
    .from('fields')
    .update({
      name: String(formData.get('name') ?? '').trim(),
      area: formData.get('area') ? Number(formData.get('area')) : null,
      soil_type: String(formData.get('soil_type') ?? '') || null,
      soil_ph: formData.get('soil_ph') ? Number(formData.get('soil_ph')) : null,
      status: (formData.get('status') as string) || 'active',
    })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/fields');
  redirect(`/fields/${id}`);
}

export async function softDeleteField(id: string) {
  const ctx = await getDashboardContext();
  if (!ctx.canAdmin) throw new Error('Insufficient permissions');

  const supabase = await createClient();
  const { error } = await supabase
    .from('fields')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/fields');
  redirect('/fields');
}

export async function createCrop(formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const fieldId = String(formData.get('field_id') ?? '');
  const cropName = String(formData.get('crop_name') ?? '').trim();
  const season = String(formData.get('season') ?? '').trim();
  if (!fieldId || !cropName || !season) throw new Error('Field, crop name, and season are required');

  const { data, error } = await supabase
    .from('crops')
    .insert({
      organization_id: ctx.organizationId,
      field_id: fieldId,
      crop_name: cropName,
      variety_name: String(formData.get('variety_name') ?? '') || null,
      season,
      planting_date: String(formData.get('planting_date') ?? '') || null,
      expected_harvest_date: String(formData.get('expected_harvest_date') ?? '') || null,
      target_yield: formData.get('target_yield') ? Number(formData.get('target_yield')) : null,
      yield_unit: String(formData.get('yield_unit') ?? '') || 'ton',
      current_stage: String(formData.get('current_stage') ?? '') || null,
      status: (formData.get('status') as string) || 'planned',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/crops');
  redirect(`/crops/${data.id}`);
}

export async function updateCrop(id: string, formData: FormData) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const { error } = await supabase
    .from('crops')
    .update({
      crop_name: String(formData.get('crop_name') ?? '').trim(),
      variety_name: String(formData.get('variety_name') ?? '') || null,
      season: String(formData.get('season') ?? '').trim(),
      planting_date: String(formData.get('planting_date') ?? '') || null,
      expected_harvest_date: String(formData.get('expected_harvest_date') ?? '') || null,
      target_yield: formData.get('target_yield') ? Number(formData.get('target_yield')) : null,
      current_stage: String(formData.get('current_stage') ?? '') || null,
      status: (formData.get('status') as string) || 'planned',
    })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/crops');
  redirect(`/crops/${id}`);
}

export async function softDeleteCrop(id: string) {
  const ctx = await requireWrite();
  const supabase = await createClient();

  const { error } = await supabase
    .from('crops')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', ctx.organizationId);

  if (error) throw new Error(error.message);
  revalidatePath('/crops');
  redirect('/crops');
}
