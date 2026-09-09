"use client";

import { supabase } from "@/lib/supabase";

/**
 * Sesión anónima: permite a cada dispositivo/agente tener su propio
 * auth.uid() sin pedir contraseña, para que RLS (auth.uid() = user_id)
 * proteja la edición/eliminación de sus captaciones.
 *
 * Requiere "Anonymous sign-ins" habilitado en Supabase:
 * Authentication → Sign In / Providers → Anonymous.
 */

let anonPromise: Promise<string | null> | null = null;

export async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user?.id) return data.session.user.id;

  if (!anonPromise) {
    anonPromise = supabase.auth
      .signInAnonymously()
      .then(({ data, error }) => {
        if (error) return null;
        if (data.session?.user?.id) {
          return data.session.user.id;
        }
        // Sin token de sesión pero con user: persistir manualmente
        if (data.user?.id) return data.user.id;
        return null;
      })
      .finally(() => {
        anonPromise = null;
      });
  }
  return anonPromise;
}

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  let token = data.session?.access_token ?? null;

  if (!token) {
    const id = await getUserId();
    if (!id) return null;
    const { data: refreshed } = await supabase.auth.getSession();
    token = refreshed.session?.access_token ?? null;
  }
  return token;
}

/** ¿El usuario actual está autenticado (anon o no)? */
export async function isAuthenticated(): Promise<boolean> {
  const id = await getUserId();
  return id !== null;
}