"use client";

import { getAuthToken } from "@/lib/auth";

/**
 * fetch que incluye el token de sesión del usuario (anon o autenticado)
 * para que RLS en Supabase resuelva auth.uid() correctamente.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const token = await getAuthToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    return fetch(url, options);
  }
}

/** Evita duplicar el header de content-type en peticiones form-data */
export async function authFetchMultipart(
  url: string,
  formData: FormData
): Promise<Response> {
  try {
    const token = await getAuthToken();
    return fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch {
    return fetch(url, { method: "POST", body: formData });
  }
}