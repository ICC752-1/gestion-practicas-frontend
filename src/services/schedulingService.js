import api from './api';

export const schedulingService = {
  async createAvailability(data) {
    const response = await api.post('/scheduling/availability', data);
    return response.data;
  },

  async updateAvailability(slotId, data) {
    const response = await api.put(`/scheduling/availability/${slotId}`, data);
    return response.data;
  },

  async getAvailableSlots(params = {}) {
    const response = await api.get('/scheduling/slots', { params });
    return response.data;
  },

  async getAppointments() {
    const response = await api.get('/scheduling/appointments');
    return response.data;
  },

  async reserveSlot(slotId, internshipId) {
    const response = await api.post(`/scheduling/slots/${slotId}/reserve`, {
      internship_id: Number(internshipId),
    });
    return response.data;
  },

  async cancelAppointment(appointmentId, reason) {
    const response = await api.post(
      `/scheduling/appointments/${appointmentId}/cancel`,
      { reason: reason || null },
    );
    return response.data;
  },

  async rescheduleAppointment(appointmentId, newSlotId) {
    const response = await api.post(
      `/scheduling/appointments/${appointmentId}/reschedule`,
      { new_slot_id: Number(newSlotId) },
    );
    return response.data;
  },

  async registerAppointmentOutcome(appointmentId, data) {
    const response = await api.patch(
      `/scheduling/appointments/${appointmentId}/outcome`,
      data,
    );
    return response.data;
  },

  async closeAvailability(slotId, reason) {
    const response = await api.post(`/scheduling/availability/${slotId}/close`, {
      reason: reason || null,
    });
    return response.data;
  },

  async deleteAvailability(slotId) {
    await api.delete(`/scheduling/availability/${slotId}`);
  },
};
