-- ============================================================
-- ADMINISTRACIÓN — Parte 1b: bloquear la llave pública (anon)
-- SOLO correr esto DESPUÉS de que Claude confirme que ya importó
-- todo el histórico del Excel a estas 6 tablas.
-- Después de esto, contabilidad solo se podrá leer/escribir a
-- través de la función de Vercel (api/contabilidad.js) con la
-- llave secreta de servicio, nunca desde el navegador directo.
-- ============================================================

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_movimientos FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_cobrar FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_pagar FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_nomina FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_proveedores FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contab_recibos FROM anon;

REVOKE USAGE, SELECT ON SEQUENCE public.contab_movimientos_id_seq FROM anon;
REVOKE USAGE, SELECT ON SEQUENCE public.contab_cuentas_cobrar_id_seq FROM anon;
REVOKE USAGE, SELECT ON SEQUENCE public.contab_cuentas_pagar_id_seq FROM anon;
REVOKE USAGE, SELECT ON SEQUENCE public.contab_nomina_id_seq FROM anon;
REVOKE USAGE, SELECT ON SEQUENCE public.contab_proveedores_id_seq FROM anon;
REVOKE USAGE, SELECT ON SEQUENCE public.contab_recibos_id_seq FROM anon;

DROP POLICY "Allow anon all contab_movimientos" ON public.contab_movimientos;
DROP POLICY "Allow anon all contab_cuentas_cobrar" ON public.contab_cuentas_cobrar;
DROP POLICY "Allow anon all contab_cuentas_pagar" ON public.contab_cuentas_pagar;
DROP POLICY "Allow anon all contab_nomina" ON public.contab_nomina;
DROP POLICY "Allow anon all contab_proveedores" ON public.contab_proveedores;
DROP POLICY "Allow anon all contab_recibos" ON public.contab_recibos;

-- RLS se queda ENCENDIDO y sin ninguna policy para anon = acceso
-- denegado por default. Solo la llave de servicio (que usa la
-- función de Vercel, nunca el navegador) puede saltarse esto.
