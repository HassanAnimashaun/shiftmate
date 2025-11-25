<template>
  <div class="request-time-off view">
    <header class="view-header">
      <nav class="breadcrumb">
        <a href="#" @click.prevent="$router && $router.back()">Back</a>
        <span>/</span>
        <span>Request Time Off</span>
      </nav>
      <h1>Request Time Off</h1>
      <p class="subtitle">Create a new time off request for approval.</p>
    </header>

    <main class="view-body">
      <form @submit.prevent="submitRequest" class="request-form">
        <div class="row">
          <label>
            Start Date
            <input type="date" v-model="startDate" required />
          </label>

          <label>
            End Date
            <input type="date" v-model="endDate" required />
          </label>
        </div>

        <div class="row">
          <label>
            Type
            <select v-model="type" required>
              <option value="" disabled>Select type</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label>
            Reason (optional)
            <textarea v-model="reason" rows="4" placeholder="Add any notes for your manager"></textarea>
          </label>
        </div>

        <div class="actions">
          <button type="submit" class="btn primary">Submit Request</button>
          <button type="button" class="btn" @click="resetForm">Cancel</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const startDate = ref('')
const endDate = ref('')
const type = ref('')
const reason = ref('')

function submitRequest() {
  // Simple validation
  if (!startDate.value || !endDate.value || !type.value) {
    alert('Please fill start date, end date and type.')
    return
  }

  const payload = {
    startDate: startDate.value,
    endDate: endDate.value,
    type: type.value,
    reason: reason.value || null,
  }

  // Replace with actual API call or store action
  console.log('Submitting time off request', payload)
  alert('Request submitted.')
  resetForm()
}

function resetForm() {
  startDate.value = ''
  endDate.value = ''
  type.value = ''
  reason.value = ''
}
</script>

<style scoped>
.view {
  max-width: 720px;
  margin: 24px auto;
  padding: 16px;
}
.view-header {
  margin-bottom: 16px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--muted, #666);
  display: flex;
  gap: 8px;
  align-items: center;
}
h1 {
  margin: 6px 0;
  font-size: 22px;
}
.subtitle {
  margin: 0;
  color: var(--muted, #666);
  font-size: 14px;
}
.view-body {
  background: var(--card-bg, #fff);
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.request-form .row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.request-form label {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: var(--text, #222);
}
input[type="date"],
select,
textarea {
  margin-top: 6px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.btn {
  padding: 8px 12px;
  border: 1px solid #bbb;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}
.btn.primary {
  background: var(--primary, #2f7fed);
  color: #fff;
  border-color: transparent;
}
</style>
