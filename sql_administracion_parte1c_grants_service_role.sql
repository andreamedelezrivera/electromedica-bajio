-- ============================================================
-- ADMINISTRACIÓN — Parte 1c: dar permisos al rol service_role
-- Causa real de "PIN incorrecto": el service_role NO tenia GRANT
-- sobre usuarios ni sobre las tablas contab_* (cada tabla en este
-- proyecto necesita su GRANT explicito por rol, igual que ya
-- pasaba con anon en todas las tablas anteriores).
-- Correr completo en el SQL Editor de Supabase.
-- ============================================================

GRANT SELECT ON public.usuarios TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_movimientos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_cobrar TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_pagar TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_nomina TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_proveedores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_recibos TO service_role;

GRANT USAGE, SELECT ON SEQUENCE public.contab_movimientos_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contab_cuentas_cobrar_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contab_cuentas_pagar_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contab_nomina_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contab_proveedores_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contab_recibos_id_seq TO service_role;
