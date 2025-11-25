# Diagrama de Classes Simplificado - AgilizaPSI

## Tabela de Classes e Atributos Principais

| Classe | Atributos Principais | Descrição |
|--------|---------------------|-----------|
| **User** | id, name, email, phone, role, password, crp, specialization, bio, experience, languages, specialties, clinicId | Usuário do sistema (ADMIN, PSICOLOGO, USER) |
| **Clinic** | id, name, email, phone, address, cnpj, description, accessToken, workingDays, workingHoursStart, workingHoursEnd, isActive | Clínica do sistema (multi-tenant) |
| **ClinicSettings** | id, clinicId, clinicName, clinicEmail, clinicPhone, workingDays, appointmentDuration, enableEmailReminders, platformPixKey | Configurações gerais da clínica |
| **Appointment** | id, psychologistId, patientId, date, startTime, endTime, duration, status, type, notes, price, meetingLink | Agendamento de consulta |
| **MedicalRecord** | id, appointmentId, patientId, psychologistId, chiefComplaint, diagnosis, treatment, observations, evolution, prescription | Prontuário eletrônico |
| **Payment** | id, appointmentId, amount, status, method, transactionId, paidAt | Pagamento de consulta |
| **Withdrawal** | id, psychologistId, amount, status, method, bankAccountId, processedAt | Saque do profissional |
| **Reminder** | id, appointmentId, userId, type, scheduledFor, sent, message | Lembrete de consulta |
| **ChatMessage** | id, senderId, receiverId, message, read, readAt | Mensagem de chat |
| **PsychologistSettings** | id, psychologistId, workingHoursStart, workingHoursEnd, defaultSessionDuration, defaultPrice, acceptOnlineAppointments, pixKey | Configurações do psicólogo |
| **Availability** | id, psychologistId, date, availableSlots, isAvailable | Disponibilidade do psicólogo |
| **BankAccount** | id, userId, paymentMethod, bankName, agency, account, pixKey, accountHolderName, cpf | Conta bancária do profissional |
| **Account** | id, userId, type, provider, providerAccountId, access_token, refresh_token | Conta de autenticação (NextAuth) |
| **Session** | id, sessionToken, userId, expires | Sessão de autenticação (NextAuth) |

---

## Relacionamentos Principais

### 1. User ↔ Clinic
- **Tipo:** Many-to-One
- **Descrição:** Um psicólogo pertence a uma clínica. Uma clínica possui vários profissionais.

### 2. User ↔ Appointment
- **Tipo:** One-to-Many (duas relações)
- **Descrição:** 
  - Um psicólogo pode ter múltiplos agendamentos
  - Um paciente pode ter múltiplos agendamentos

### 3. Appointment ↔ MedicalRecord
- **Tipo:** One-to-One
- **Descrição:** Um agendamento pode gerar um prontuário eletrônico.

### 4. Appointment ↔ Payment
- **Tipo:** One-to-One
- **Descrição:** Um agendamento pode ter um pagamento associado.

### 5. User ↔ PsychologistSettings
- **Tipo:** One-to-One
- **Descrição:** Um psicólogo possui configurações específicas.

### 6. User ↔ Availability
- **Tipo:** One-to-Many
- **Descrição:** Um psicólogo possui múltiplas disponibilidades.

### 7. User ↔ BankAccount
- **Tipo:** One-to-One
- **Descrição:** Um usuário pode ter uma conta bancária cadastrada.

### 8. User ↔ Withdrawal
- **Tipo:** One-to-Many
- **Descrição:** Um psicólogo pode solicitar múltiplos saques.

### 9. Appointment ↔ Reminder
- **Tipo:** One-to-Many
- **Descrição:** Um agendamento pode gerar múltiplos lembretes.

### 10. User ↔ ChatMessage
- **Tipo:** One-to-Many (duas relações)
- **Descrição:** 
  - Um usuário pode enviar múltiplas mensagens
  - Um usuário pode receber múltiplas mensagens

---

## Enumeradores (Enums)

| Enum | Valores |
|------|---------|
| **UserRole** | USER, ADMIN, PSICOLOGO |
| **AppointmentStatus** | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| **AppointmentType** | ONLINE, PRESENCIAL |
| **PaymentStatus** | PENDING, PAID, CANCELLED, REFUNDED |
| **PaymentMethod** | PIX, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CASH |
| **WithdrawalStatus** | PENDING, PROCESSING, COMPLETED, CANCELLED, REJECTED |
| **ReminderType** | EMAIL, SMS, WHATSAPP |
| **PsychiatricFollowUp** | NAO, SIM, JA_FEZ |

---

## Diagrama de Relacionamentos Simplificado

```
┌─────────────┐
│    User     │
│  (ADMIN,    │
│ PSICOLOGO,  │
│    USER)    │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       │                                     │
┌──────▼──────┐                    ┌─────────▼─────────┐
│   Clinic    │                    │   Appointment     │
│             │                    │                   │
│ - name      │                    │ - date            │
│ - email     │                    │ - status          │
│ - phone     │                    │ - type            │
│ - cnpj      │                    │ - meetingLink     │
└──────┬──────┘                    └─────────┬─────────┘
       │                                     │
       │                                     ├──────────────┐
       │                                     │              │
┌──────▼──────┐                    ┌─────────▼─────────┐  │
│ClinicSettings│                   │  MedicalRecord    │  │
│             │                    │                   │  │
│ - workingDays│                   │ - chiefComplaint  │  │
│ - appointmentDuration│           │ - diagnosis       │  │
│ - enableEmailReminders│          │ - treatment       │  │
└─────────────┘                    └───────────────────┘  │
                                                           │
                                                           │
┌─────────────┐                    ┌─────────▼─────────┐  │
│PsychologistSettings│              │     Payment       │  │
│             │                    │                   │  │
│ - defaultPrice│                  │ - amount          │  │
│ - pixKey     │                    │ - status          │  │
│ - acceptOnlineAppointments│       │ - method          │  │
└─────────────┘                    └───────────────────┘  │
                                                           │
┌─────────────┐                    ┌─────────▼─────────┐  │
│ Availability │                   │     Reminder     │  │
│             │                    │                   │  │
│ - date      │                    │ - type            │  │
│ - availableSlots│                 │ - scheduledFor    │  │
│ - isAvailable│                    │ - sent            │  │
└─────────────┘                    └───────────────────┘  │
                                                           │
┌─────────────┐                    ┌─────────▼─────────┐
│ BankAccount │                    │   ChatMessage     │
│             │                    │                   │
│ - bankName  │                    │ - message         │
│ - agency    │                    │ - read            │
│ - account   │                    │ - readAt          │
│ - pixKey    │                    └───────────────────┘
└──────┬──────┘
       │
       │
┌──────▼──────┐
│ Withdrawal  │
│             │
│ - amount    │
│ - status    │
│ - method    │
└─────────────┘
```

---

## Características do Sistema

### 1. Multi-tenancy
- Cada clínica opera de forma isolada
- Profissionais só veem dados da sua clínica
- Filtragem automática por `clinicId`

### 2. Roles e Permissões
- **ADMIN:** Acesso total ao sistema
- **PSICOLOGO:** Dashboard profissional da sua clínica
- **USER:** Agendamento e comunicação

### 3. Integridade de Dados
- Relacionamentos com `onDelete: Cascade` onde apropriado
- Campos obrigatórios e opcionais bem definidos
- Índices para otimização de consultas

### 4. Auditoria
- Todas as entidades possuem `createdAt` e `updatedAt`
- Rastreamento de alterações

---

**Data de Criação:** 2025  
**Versão do Documento:** 1.0

