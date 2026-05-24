# Finanzas JL Pro - Base contable con Terceros e Inventario

Esta versión amplía la base anterior e incluye tres módulos conectados:

## Módulos

1. Nuevo comprobante
2. Terceros
3. Inventario
4. Historial
5. Reportes base
6. Dashboard inicial

## Funcionalidad incluida

- Registro de terceros:
  - Cliente
  - Proveedor
  - Cliente y proveedor
  - Empleado
  - Acreedor
  - Otro

- Registro de inventario:
  - Producto
  - Servicio
  - Activo
  - Insumo

- Nuevo comprobante:
  - Factura de venta
  - Factura de compra
  - Cuenta por pagar
  - Comprobante de egreso
  - Recibo de caja

- Integraciones internas:
  - Los terceros registrados aparecen en Nuevo comprobante.
  - El inventario registrado aparece en la tabla de ítems.
  - Al seleccionar un producto/servicio, se cargan código, descripción, unidad, precio e IVA.
  - Los comprobantes guardados aparecen en Historial.
  - El dashboard suma ingresos, gastos, terceros e inventario.

## Almacenamiento

Esta versión usa localStorage para pruebas locales.
Más adelante se puede cambiar por Firebase Firestore.

## Cómo probar

1. Abre `index.html`.
2. Registra un tercero.
3. Registra un producto o servicio.
4. Ve a Nuevo.
5. Selecciona un tipo de comprobante.
6. Selecciona tercero e ítem.
7. Guarda el comprobante.
8. Revisa Historial e Inicio.


## Corrección Fix Items

Esta versión mejora la tabla de ítems:
- Selección estable desde inventario.
- Carga automática de código, descripción, unidad, precio e IVA.
- Recalcula subtotal, descuento, IVA y total.
- Permite registrar ítems manuales.
- Mantiene mínimo un ítem por comprobante.
