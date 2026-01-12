# Modelo Contable y Flujo Financiero
**The Teacher's House - Sistema de Gestión Escolar**

Este documento describe la arquitectura financiera implementada en el sistema, basada en un modelo de **Contabilidad de Devengo (Accrual Accounting)** adaptado a instituciones educativas.

## 1. Conceptos Fundamentales

### Contabilidad de Devengo
A diferencia de un sistema de caja simple (donde solo importa el dinero que entra/sale), este sistema reconoce las obligaciones económicas (deudas) en el momento en que ocurren, independientemente de cuándo se paguen.

*   **Deuda (Cuenta por Cobrar)**: Nace cuando el estudiante se inscribe o comienza un mes.
*   **Transacción (Ingreso)**: Ocurre cuando el representante paga.
*   **Devengo (Saldo)**: La diferencia real entre lo que *debería haber pagado* vs lo que *ha pagado*.

---

## 2. El Flujo de Trabajo (Workflow)

El ciclo de vida financiero de un estudiante sigue estos pasos automáticos:

### A. Nacimiento de la Obligación (Trigger)
Cuando se registra un nuevo estudiante:
1.  **Creación del Perfil**: Se genera un `PerfilFinanciero` (Libro Mayor del estudiante).
2.  **Deuda Inicial**: Se genera inmediatamente la deuda de **Inscripción** asociada al Periodo Escolar activo.
3.  **Estado Bloqueado**: El estudiante nace `Inactivo`. No aparece en listas ni asistencias.

### B. Motor de Tarifas (Pricing Engine)
Antes de guardar cualquier deuda, el sistema consulta el **Motor de Precios**:
1.  Obtiene el **Costo Base** del Periodo Escolar (ej. $30 Inscripción, $70 Mensualidad).
2.  Verifica si el estudiante tiene una **Beca** activa.
3.  Aplica el descuento (Porcentaje o Monto Fijo).
4.  Registra la deuda con el **Monto Neto** final.

### C. Aplicación de Pagos (Waterfall Algorithm)
Cuando se registra un pago (`Transacción`), el sistema imputa el dinero usando una lógica de cascada:
1.  **Prioridad FIFO**: Paga primero las deudas más antiguas.
2.  **Prioridad Conceptual**: Paga siempre la Inscripción antes que las Mensualidades.
3.  **Activación**: Si el pago cubre la Inscripción:
    *   El estudiante pasa a estatus `Activo`.
    *   **Se genera automáticamente la primera Mensualidad**.

### D. Conciliación (Audit)
El saldo que se muestra en el Monitor de Cobranza sigue la fórmula de auditoría estricta:

> **Saldo = (Total Pagos Históricos) - (Total Deudas Históricas)**

Esto asegura que el saldo siempre refleje la realidad exacta, sin importar el orden de los pagos o deudas parciales.

---

## 3. Procesos Recurrentes (Batch Processing)

### Corte de Mes
Para la facturación mensual masiva:
1.  El sistema busca todos los estudiantes `Activos`.
2.  Genera la deuda de Mensualidad correspondiente al mes actual.
3.  **Idempotencia**: Impide cobrar el mismo mes dos veces al mismo estudiante.
4.  Genera un registro de auditoría (`RegistroCorteMes`) con los totales procesados.

## 4. Gestión de Becas Dinámicas
El sistema soporta la actualización dinámica de beneficios:
*   Si se asigna o modifica una beca a mitad de proceso, el sistema **recalcula automáticamente** las deudas pendientes de pago para reflejar el nuevo precio, asegurando que el cobro futuro respete el nuevo acuerdo.
