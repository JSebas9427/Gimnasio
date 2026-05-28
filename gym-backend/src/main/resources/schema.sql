-- =============================================
-- SCRIPT CREACIÓN BASE DE DATOS
-- Sistema de Gestión de Gimnasio
-- =============================================

CREATE DATABASE IF NOT EXISTS gym_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gym_db;

-- =============================================
-- TABLA: cliente
-- =============================================
CREATE TABLE IF NOT EXISTS cliente (
    CC          INT(10)      NOT NULL,
    nombre_1    VARCHAR(20)  NOT NULL,
    nombre_2    VARCHAR(20)  NULL,
    apellido_1  VARCHAR(20)  NOT NULL,
    apellido_2  VARCHAR(20)  NULL,
    fecha_registro DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    telefono    VARCHAR(10)  NULL,
    correo      VARCHAR(20)  NULL,
    PRIMARY KEY (CC)
);

-- =============================================
-- TABLA: vendedor
-- =============================================
CREATE TABLE IF NOT EXISTS vendedor (
    CC          INT(10)      NOT NULL,
    nombre_1    VARCHAR(20)  NOT NULL,
    nombre_2    VARCHAR(20)  NULL,
    apellido_1  VARCHAR(20)  NOT NULL,
    apellido_2  VARCHAR(20)  NULL,
    cargo       VARCHAR(20)  NULL,
    telefono    VARCHAR(10)  NULL,
    correo      VARCHAR(20)  NULL,
    PRIMARY KEY (CC)
);

-- =============================================
-- TABLA: plan
-- =============================================
CREATE TABLE IF NOT EXISTS plan (
    id_plan     INT(11)         NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(20)     NOT NULL,
    precio      DECIMAL(10,2)   NOT NULL,
    duracion    INT(11)         NOT NULL COMMENT 'Duración en días',
    descripcion VARCHAR(100)    NULL,
    PRIMARY KEY (id_plan)
);

-- =============================================
-- TABLA: factura
-- =============================================
CREATE TABLE IF NOT EXISTS factura (
    id_factura  INT(11)      NOT NULL AUTO_INCREMENT,
    plan_id     INT(11)      NULL,
    cliente_cc  INT(11)      NULL,
    cc_vendedor INT(11)      NOT NULL,
    metodo_pago VARCHAR(20)  NULL,
    fecha_inicio DATE        NULL,
    fecha_fin   DATE         NULL,
    tipo        ENUM('MENSUALIDAD','DIARIO') NOT NULL DEFAULT 'MENSUALIDAD',
    PRIMARY KEY (id_factura),
    CONSTRAINT fk_factura_plan
        FOREIGN KEY (plan_id) REFERENCES plan(id_plan),
    CONSTRAINT fk_factura_cliente
        FOREIGN KEY (cliente_cc) REFERENCES cliente(CC),
    CONSTRAINT fk_factura_vendedor
        FOREIGN KEY (cc_vendedor) REFERENCES vendedor(CC)
);

-- =============================================
-- TABLA: detalle_factura
-- =============================================
CREATE TABLE IF NOT EXISTS detalle_factura (
    id_detalle_factura  INT(11)         NOT NULL AUTO_INCREMENT,
    id_factura          INT(11)         NOT NULL,
    descripcion         VARCHAR(200)    NULL,
    valor_pagado        DECIMAL(10,2)   NOT NULL,
    PRIMARY KEY (id_detalle_factura),
    CONSTRAINT fk_detalle_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id_factura)
        ON DELETE CASCADE
);

-- =============================================
-- DATOS DE PRUEBA
-- =============================================
INSERT INTO vendedor (CC, nombre_1, apellido_1, cargo, telefono, correo)
VALUES (12345678, 'Admin', 'Gimnasio', 'Administrador', '3001234567', 'admin@gimnasio.com');

INSERT INTO plan (nombre, precio, duracion, descripcion)
VALUES
    ('Básico',   80000.00, 30,  'Acceso a sala de pesas y cardio'),
    ('Premium', 120000.00, 30,  'Acceso completo + clases grupales'),
    ('Anual',   800000.00, 365, 'Plan anual con todos los beneficios');
