-- ============================================================
-- ADMINISTRACIÓN — Parte 1: tablas nuevas de contabilidad
-- Correr completo en el SQL Editor de Supabase.
-- ============================================================

CREATE TABLE public.contab_movimientos (
  id serial PRIMARY KEY,
  fecha date NOT NULL,
  tipo text NOT NULL,               -- 'INGRESO' | 'GASTO'
  categoria text NOT NULL,          -- ver lista fija abajo
  proyecto text,
  descripcion text,
  cliente_proveedor text,
  metodo text,                      -- 'Efectivo' | 'Transferencia' | 'Tarjeta'
  entrada numeric DEFAULT 0,
  salida numeric DEFAULT 0,
  cuenta text,                      -- 'BANREGIO' | 'CAJA' | 'SANTANDER'
  factura text,
  responsable_id integer REFERENCES public.usuarios(id),
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.contab_cuentas_cobrar (
  id serial PRIMARY KEY,
  folio text,
  cliente text,
  proyecto text,
  concepto text,
  monto_total numeric NOT NULL DEFAULT 0,
  cobrado numeric NOT NULL DEFAULT 0,
  fecha_compromiso date,
  factura text,
  observaciones text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.contab_cuentas_pagar (
  id serial PRIMARY KEY,
  folio text,
  beneficiario text,
  proyecto text,
  concepto text,
  monto_total numeric NOT NULL DEFAULT 0,
  pagado numeric NOT NULL DEFAULT 0,
  fecha_compromiso date,
  factura text,
  observaciones text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.contab_nomina (
  id serial PRIMARY KEY,
  folio text,
  empleado_id integer REFERENCES public.usuarios(id),
  proyecto text,
  sueldo_base numeric NOT NULL DEFAULT 0,
  viaticos numeric NOT NULL DEFAULT 0,
  bonos numeric NOT NULL DEFAULT 0,
  pagado numeric NOT NULL DEFAULT 0,
  periodo text,                     -- ej. "1-15 JUNIO"
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.contab_proveedores (
  id serial PRIMARY KEY,
  proveedor text NOT NULL,
  descripcion text,
  nombre_contacto text,
  telefono text,
  contacto_previo boolean,
  compra_previa boolean,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.contab_recibos (
  id serial PRIMARY KEY,
  folio text UNIQUE NOT NULL,       -- REC-XXX, autogenerado por la app
  tipo_pago text NOT NULL,          -- 'efectivo' | 'transferencia' | 'otro'
  referencia text,                  -- EFE-XXX (efectivo) o número de operación (transferencia)
  cliente_nombre text NOT NULL,
  cliente_rfc text,
  cliente_direccion text,
  cliente_telefono text,
  conceptos jsonb NOT NULL,         -- [{descripcion,cantidad,precio_unitario,importe}]
  total numeric NOT NULL,
  anticipo_recibido numeric,
  saldo_pendiente numeric,
  es_finiquito boolean DEFAULT false,
  forma_pago text,
  recibido_por text,
  movimiento_id integer REFERENCES public.contab_movimientos(id),
  cuenta_cobrar_id integer REFERENCES public.contab_cuentas_cobrar(id),
  creado_por integer REFERENCES public.usuarios(id),
  creado_en timestamptz DEFAULT now()
);

-- Permisos para el rol anon (mismo patrón que el resto del proyecto)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_movimientos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_cobrar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_cuentas_pagar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_nomina TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_proveedores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contab_recibos TO anon;

GRANT USAGE, SELECT ON SEQUENCE public.contab_movimientos_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.contab_cuentas_cobrar_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.contab_cuentas_pagar_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.contab_nomina_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.contab_proveedores_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.contab_recibos_id_seq TO anon;

ALTER TABLE public.contab_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_cuentas_cobrar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_cuentas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contab_recibos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all contab_movimientos" ON public.contab_movimientos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all contab_cuentas_cobrar" ON public.contab_cuentas_cobrar FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all contab_cuentas_pagar" ON public.contab_cuentas_pagar FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all contab_nomina" ON public.contab_nomina FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all contab_proveedores" ON public.contab_proveedores FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all contab_recibos" ON public.contab_recibos FOR ALL TO anon USING (true) WITH CHECK (true);
