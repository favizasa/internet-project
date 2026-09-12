

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- para gen_random_uuid()

DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('Cliente', 'Proveedor', 'Soporte', 'Administrador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_ticket AS ENUM ('Pendiente', 'En Proceso', 'Resuelto', 'Escalado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM ('Pendiente', 'Aprobada', 'Rechazada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(150) NOT NULL,
    tipo_documento  VARCHAR(20)  NOT NULL DEFAULT 'DNI',
    numero_documento VARCHAR(20) NOT NULL,
    celular         VARCHAR(20),
    correo          VARCHAR(150) NOT NULL UNIQUE,
    contrasenia_hash TEXT NOT NULL,
    rol             rol_usuario NOT NULL DEFAULT 'Cliente',
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tipo_documento, numero_documento)
);

CREATE TABLE IF NOT EXISTS proveedores_wisp (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    ruc                 VARCHAR(20) NOT NULL UNIQUE,
    razon_social         VARCHAR(150) NOT NULL,
    zona_cobertura_texto VARCHAR(200),
    estado_licencia     VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS planes_internet (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id    UUID REFERENCES proveedores_wisp(id) ON DELETE CASCADE,
    nombre_plan     VARCHAR(150) NOT NULL,
    tipo_tecnologia VARCHAR(20) NOT NULL DEFAULT 'Fibra', -- Fibra | Antena | Híbrido
    velocidad_mbps  INTEGER NOT NULL,
    precio_mensual  NUMERIC(8,2) NOT NULL,
    zona_cobertura  VARCHAR(150) NOT NULL,
    soporte         VARCHAR(150),
    estado_activo   BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS solicitudes_servicio (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plan_id         UUID NOT NULL REFERENCES planes_internet(id),
    sector          VARCHAR(100),
    manzana         VARCHAR(20),
    lote            VARCHAR(20),
    referencia      TEXT,
    horario_preferido VARCHAR(20) DEFAULT 'Mañana',
    estado          estado_solicitud NOT NULL DEFAULT 'Pendiente',
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS tickets_soporte (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_hash         VARCHAR(20) NOT NULL UNIQUE,
    cliente_id          UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tecnico_id          UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    categoria_falla     VARCHAR(80) NOT NULL,
    descripcion         TEXT NOT NULL,
    diagnostico_tecnico TEXT,
    acciones_realizadas TEXT,
    estado_ticket       estado_ticket NOT NULL DEFAULT 'Pendiente',
    fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_asignacion    TIMESTAMPTZ,
    fecha_cierre        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets_soporte(estado_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_cliente ON tickets_soporte(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planes_proveedor ON planes_internet(proveedor_id);

