import { prismaClient } from "@/lib/db";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
} from "@/actions/appointments";
import { AppointmentStatus, AppointmentType } from "@prisma/client";

describe("Appointments CRUD - Integration Tests", () => {
  let psychologistId: string;
  let patientId: string;
  let appointmentId: string;

  // Setup: Criar usuários de teste antes de todos os testes
  beforeAll(async () => {
    // Criar psicólogo de teste
    const psychologist = await prismaClient.user.create({
      data: {
        name: "Dr. Test Psychologist",
        email: `psychologist-${Date.now()}@test.com`,
        phone: "1234567890",
        password: "hashed_password",
        role: "PSICOLOGO",
        token: 123456,
        isVerfied: true,
      },
    });
    psychologistId = psychologist.id;

    // Criar paciente de teste
    const patient = await prismaClient.user.create({
      data: {
        name: "Test Patient",
        email: `patient-${Date.now()}@test.com`,
        phone: "0987654321",
        password: "hashed_password",
        role: "USER",
        token: 654321,
        isVerfied: true,
      },
    });
    patientId = patient.id;
  });

  // Cleanup: Remover dados de teste após todos os testes
  afterAll(async () => {
    // Deletar appointments
    await prismaClient.appointment.deleteMany({
      where: {
        OR: [
          { psychologistId },
          { patientId },
        ],
      },
    });

    // Deletar usuários
    await prismaClient.user.deleteMany({
      where: {
        id: {
          in: [psychologistId, patientId],
        },
      },
    });

    await prismaClient.$disconnect();
  });

  // Limpar appointments entre testes
  afterEach(async () => {
    await prismaClient.appointment.deleteMany({
      where: {
        psychologistId,
      },
    });
  });

  describe("CREATE - Criar Agendamento", () => {
    it("deve criar um agendamento com sucesso", async () => {
      const appointmentData = {
        psychologistId,
        patientId,
        date: new Date("2024-12-01"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
        notes: "Primeira sessão",
        price: 150.0,
      };

      const result = await createAppointment(appointmentData);

      expect(result.status).toBe(201);
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.psychologistId).toBe(psychologistId);
      expect(result.data?.patientId).toBe(patientId);
      expect(result.data?.startTime).toBe("10:00");
      expect(result.data?.status).toBe("PENDING");

      appointmentId = result.data!.id;
    });

    it("deve criar um agendamento sem paciente (horário disponível)", async () => {
      const appointmentData = {
        psychologistId,
        date: new Date("2024-12-01"),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        type: "PRESENCIAL" as AppointmentType,
      };

      const result = await createAppointment(appointmentData);

      expect(result.status).toBe(201);
      expect(result.error).toBeNull();
      expect(result.data?.patientId).toBeNull();
    });

    it("deve retornar erro ao criar agendamento com horário conflitante", async () => {
      // Criar primeiro agendamento
      await createAppointment({
        psychologistId,
        date: new Date("2024-12-01"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      // Tentar criar agendamento conflitante
      const result = await createAppointment({
        psychologistId,
        date: new Date("2024-12-01"),
        startTime: "10:30",
        endTime: "11:30",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      expect(result.status).toBe(409);
      expect(result.error).toContain("Conflito de horário");
      expect(result.data).toBeNull();
    });

    it("deve retornar erro com psicólogo inválido", async () => {
      const result = await createAppointment({
        psychologistId: "invalid_id_123",
        date: new Date("2024-12-01"),
        startTime: "16:00",
        endTime: "17:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      expect(result.status).toBe(404);
      expect(result.error).toContain("Psicólogo não encontrado");
    });

    it("deve retornar erro com paciente inválido", async () => {
      const result = await createAppointment({
        psychologistId,
        patientId: "invalid_patient_id",
        date: new Date("2024-12-01"),
        startTime: "16:00",
        endTime: "17:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      expect(result.status).toBe(404);
      expect(result.error).toContain("Paciente não encontrado");
    });
  });

  describe("READ - Listar e Buscar Agendamentos", () => {
    beforeEach(async () => {
      // Criar agendamentos de teste
      await createAppointment({
        psychologistId,
        patientId,
        date: new Date("2024-12-01"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      await createAppointment({
        psychologistId,
        date: new Date("2024-12-02"),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        type: "PRESENCIAL" as AppointmentType,
      });
    });

    it("deve listar todos os agendamentos", async () => {
      const result = await getAppointments();

      expect(result.status).toBe(200);
      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    it("deve listar agendamentos por psicólogo", async () => {
      const result = await getAppointments({ psychologistId });

      expect(result.status).toBe(200);
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
      expect(result.data!.every((apt) => apt.psychologistId === psychologistId)).toBe(true);
    });

    it("deve listar agendamentos por paciente", async () => {
      const result = await getAppointments({ patientId });

      expect(result.status).toBe(200);
      expect(result.data!.length).toBeGreaterThanOrEqual(1);
      expect(result.data!.every((apt) => apt.patientId === patientId)).toBe(true);
    });

    it("deve listar agendamentos por status", async () => {
      const result = await getAppointments({ status: "PENDING" as AppointmentStatus });

      expect(result.status).toBe(200);
      expect(result.data!.every((apt) => apt.status === "PENDING")).toBe(true);
    });

    it("deve listar agendamentos por tipo", async () => {
      const result = await getAppointments({ type: "ONLINE" as AppointmentType });

      expect(result.status).toBe(200);
      expect(result.data!.every((apt) => apt.type === "ONLINE")).toBe(true);
    });

    it("deve listar agendamentos por período de datas", async () => {
      const result = await getAppointments({
        dateFrom: new Date("2024-12-01"),
        dateTo: new Date("2024-12-31"),
      });

      expect(result.status).toBe(200);
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    it("deve buscar agendamento por ID", async () => {
      const appointments = await getAppointments({ psychologistId });
      const testAppointmentId = appointments.data![0].id;

      const result = await getAppointmentById(testAppointmentId);

      expect(result.status).toBe(200);
      expect(result.error).toBeNull();
      expect(result.data?.id).toBe(testAppointmentId);
    });

    it("deve retornar erro ao buscar agendamento com ID inválido", async () => {
      const result = await getAppointmentById("invalid_id_xyz");

      expect(result.status).toBe(404);
      expect(result.error).toContain("não encontrado");
    });
  });

  describe("UPDATE - Atualizar Agendamento", () => {
    let testAppointmentId: string;

    beforeEach(async () => {
      const appointment = await createAppointment({
        psychologistId,
        patientId,
        date: new Date("2024-12-01"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });
      testAppointmentId = appointment.data!.id;
    });

    it("deve atualizar status do agendamento", async () => {
      const result = await updateAppointment(testAppointmentId, {
        status: "CONFIRMED" as AppointmentStatus,
      });

      expect(result.status).toBe(200);
      expect(result.error).toBeNull();
      expect(result.data?.status).toBe("CONFIRMED");
    });

    it("deve atualizar horário do agendamento", async () => {
      const result = await updateAppointment(testAppointmentId, {
        startTime: "11:00",
        endTime: "12:00",
      });

      expect(result.status).toBe(200);
      expect(result.data?.startTime).toBe("11:00");
      expect(result.data?.endTime).toBe("12:00");
    });

    it("deve atualizar notas do agendamento", async () => {
      const result = await updateAppointment(testAppointmentId, {
        notes: "Paciente relatou progresso significativo",
      });

      expect(result.status).toBe(200);
      expect(result.data?.notes).toBe("Paciente relatou progresso significativo");
    });

    it("deve atualizar preço do agendamento", async () => {
      const result = await updateAppointment(testAppointmentId, {
        price: 200.0,
      });

      expect(result.status).toBe(200);
      expect(result.data?.price).toBe(200.0);
    });

    it("deve retornar erro ao atualizar para horário conflitante", async () => {
      // Criar outro agendamento
      await createAppointment({
        psychologistId,
        date: new Date("2024-12-01"),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      // Tentar atualizar para horário conflitante
      const result = await updateAppointment(testAppointmentId, {
        startTime: "14:00",
        endTime: "15:00",
      });

      expect(result.status).toBe(409);
      expect(result.error).toContain("Conflito de horário");
    });

    it("deve retornar erro ao atualizar agendamento inexistente", async () => {
      const result = await updateAppointment("invalid_id_abc", {
        status: "COMPLETED" as AppointmentStatus,
      });

      expect(result.status).toBe(404);
      expect(result.error).toContain("não encontrado");
    });
  });

  describe("DELETE - Deletar Agendamento", () => {
    it("deve deletar agendamento com sucesso", async () => {
      const appointment = await createAppointment({
        psychologistId,
        date: new Date("2024-12-01"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      const result = await deleteAppointment(appointment.data!.id);

      expect(result.status).toBe(200);
      expect(result.error).toBeNull();
      expect(result.data?.message).toContain("deletado com sucesso");

      // Verificar que foi realmente deletado
      const getResult = await getAppointmentById(appointment.data!.id);
      expect(getResult.status).toBe(404);
    });

    it("deve retornar erro ao deletar agendamento inexistente", async () => {
      const result = await deleteAppointment("invalid_id_delete");

      expect(result.status).toBe(404);
      expect(result.error).toContain("não encontrado");
    });
  });

  describe("AVAILABLE SLOTS - Horários Disponíveis", () => {
    beforeEach(async () => {
      // Criar alguns agendamentos
      await createAppointment({
        psychologistId,
        date: new Date("2024-12-05"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      await createAppointment({
        psychologistId,
        date: new Date("2024-12-05"),
        startTime: "14:00",
        endTime: "15:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });
    });

    it("deve buscar horários disponíveis corretamente", async () => {
      const result = await getAvailableSlots(psychologistId, "2024-12-05");

      expect(result.status).toBe(200);
      expect(result.error).toBeNull();
      expect(result.data?.date).toBeDefined();
      expect(result.data?.workingHours).toEqual({ start: "08:00", end: "18:00" });
      expect(result.data?.bookedSlots.length).toBe(2);
      expect(result.data?.availableSlots).toBeDefined();
      expect(Array.isArray(result.data?.availableSlots)).toBe(true);
    });

    it("deve retornar todos os horários disponíveis quando não há agendamentos", async () => {
      const result = await getAvailableSlots(psychologistId, "2024-12-06");

      expect(result.status).toBe(200);
      expect(result.data?.bookedSlots.length).toBe(0);
      expect(result.data?.availableSlots.length).toBeGreaterThan(0);
    });

    it("deve retornar erro com psicólogo inválido", async () => {
      const result = await getAvailableSlots("invalid_psych_id", "2024-12-05");

      expect(result.status).toBe(404);
      expect(result.error).toContain("Psicólogo não encontrado");
    });
  });

  describe("EDGE CASES - Casos Especiais", () => {
    it("deve permitir múltiplos agendamentos em horários diferentes", async () => {
      const times = [
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
      ];

      for (const time of times) {
        const result = await createAppointment({
          psychologistId,
          date: new Date("2024-12-10"),
          startTime: time.start,
          endTime: time.end,
          duration: 60,
          type: "ONLINE" as AppointmentType,
        });

        expect(result.status).toBe(201);
      }

      const appointments = await getAppointments({
        psychologistId,
        dateFrom: new Date("2024-12-10"),
        dateTo: new Date("2024-12-10"),
      });

      expect(appointments.data!.length).toBe(3);
    });

    it("deve permitir cancelar agendamento (status CANCELLED)", async () => {
      const appointment = await createAppointment({
        psychologistId,
        date: new Date("2024-12-15"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      const result = await updateAppointment(appointment.data!.id, {
        status: "CANCELLED" as AppointmentStatus,
      });

      expect(result.status).toBe(200);
      expect(result.data?.status).toBe("CANCELLED");
    });

    it("deve permitir completar agendamento (status COMPLETED)", async () => {
      const appointment = await createAppointment({
        psychologistId,
        patientId,
        date: new Date("2024-12-16"),
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        type: "ONLINE" as AppointmentType,
      });

      const result = await updateAppointment(appointment.data!.id, {
        status: "COMPLETED" as AppointmentStatus,
        notes: "Sessão concluída com sucesso",
      });

      expect(result.status).toBe(200);
      expect(result.data?.status).toBe("COMPLETED");
      expect(result.data?.notes).toBe("Sessão concluída com sucesso");
    });
  });
});


