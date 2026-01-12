# Accounting Model and Financial Flow
**The Teacher's House - School Management System**

This document describes the financial architecture implemented in the system, based on an **Accrual Accounting** model adapted for educational institutions.

## 1. Fundamental Concepts

### Accrual Accounting
Unlike a simple cash basis system (where only money in/out matters), this system recognizes economic obligations (debts) the moment they occur, regardless of when they are paid.

*   **Debt (Account Receivable)**: Created when the student enrolls or a new month begins.
*   **Transaction (Income)**: Occurs when the guardian makes a payment.
*   **Accrual (Balance)**: The actual difference between what *should have been paid* vs what *has been paid*.

---

## 2. Workflow

The financial lifecycle of a student follows these automated steps:

### A. Liability Trigger
When a new student is registered:
1.  **Profile Creation**: A `FinancialProfile` (Student General Ledger) is generated.
2.  **Initial Debt**: The **Enrollment** debt associated with the active School Period is generated immediately.
3.  **Locked State**: The student is born `Inactive`. They do not appear in lists or attendance.

### B. Pricing Engine
Before saving any debt, the system consults the **Pricing Engine**:
1.  Obtains the **Base Cost** of the School Period (e.g., $30 Enrollment, $70 Monthly Fee).
2.  Checks if the student has an active **Scholarship**.
3.  Applies the discount (Percentage or Fixed Amount).
4.  Registers the debt with the final **Net Amount**.

### C. Payment Application (Waterfall Algorithm)
When a payment (`Transaction`) is registered, the system allocates the money using a waterfall logic:
1.  **FIFO Priority**: Pays off the oldest debts first.
2.  **Conceptual Priority**: Always pays Enrollment before Monthly Fees.
3.  **Activation**: If the payment covers Enrollment:
    *   The student status changes to `Active`.
    *   **The first Monthly Fee is automatically generated**.

### D. Reconciliation (Audit)
The balance shown in the Collection Monitor follows a strict audit formula:

> **Balance = (Total Historical Payments) - (Total Historical Debts)**

This ensures the balance always reflects the exact reality, regardless of payment order or partial debts.

---

## 3. Recurring Processes (Batch Processing)

### Monthly Cut-off
For massive monthly billing:
1.  The system searches for all `Active` students.
2.  Generates the Monthly Fee debt corresponding to the current month.
3.  **Idempotency**: Prevents charging the same month twice to the same student.
4.  Generates an audit record (`MonthlyCutoffLog`) with processed totals.

## 4. Dynamic Scholarship Management
The system supports dynamic benefit updates:
*   If a scholarship is assigned or modified mid-process, the system **automatically recalculates** unpaid debts to reflect the new price, ensuring future collections respect the new agreement.
