<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs px-4">
    <div class="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
      <button
        type="button"
        class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        @click="$emit('close')"
      >
        ✕
      </button>

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">Shift Templates</h2>
        <button
          type="button"
          :disabled="restoring"
          class="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition disabled:opacity-50"
          @click="handleRestoreDefaults"
        >
          {{ restoring ? 'Restoring...' : 'Restore defaults' }}
        </button>
      </div>

      <!-- Template list -->
      <div class="space-y-2 mb-6">
        <div
          v-for="tmpl in templates"
          :key="tmpl.id"
          class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ tmpl.name }}</p>
            <p class="text-xs text-gray-500">
              {{ tmpl.startTime }} – {{ tmpl.endTime }}
              <span class="ml-2 text-gray-400">({{ tmpl.scheduledHours }}h)</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-xs text-purple-600 hover:underline"
              @click="startEdit(tmpl)"
            >
              Edit
            </button>
            <button
              type="button"
              class="text-xs text-red-500 hover:underline"
              @click="handleDelete(tmpl.id)"
            >
              Remove
            </button>
          </div>
        </div>
        <p v-if="templates.length === 0" class="text-sm text-gray-400 text-center py-4">
          No templates yet.
        </p>
      </div>

      <!-- Add / Edit form -->
      <div class="border-t border-gray-100 pt-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">
          {{ editingId ? 'Edit Template' : '+ New Template' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Full day"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600">Start Time</label>
              <input
                v-model="form.startTime"
                type="time"
                required
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600">End Time</label>
              <input
                v-model="form.endTime"
                type="time"
                required
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <p v-if="calculatedHours !== null" class="text-xs text-gray-500">
            Duration: {{ calculatedHours }}h
          </p>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex gap-2 justify-end">
            <button
              v-if="editingId"
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-400 px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              {{ saving ? 'Saving...' : editingId ? 'Update' : 'Add Template' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import adminScheduleService from '@/services/admin/adminScheduleService';

const EMPTY_FORM = { name: '', startTime: '', endTime: '' };

export default {
  name: 'TemplateManager',
  props: {
    templates: { type: Array, required: true },
  },
  emits: ['close', 'updated'],
  data() {
    return {
      form: { ...EMPTY_FORM },
      editingId: null,
      saving: false,
      restoring: false,
      formError: '',
    };
  },
  computed: {
    calculatedHours() {
      if (!this.form.startTime || !this.form.endTime) return null;
      const [sh, sm] = this.form.startTime.split(':').map(Number);
      const [eh, em] = this.form.endTime.split(':').map(Number);
      const h = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      return h > 0 ? h : null;
    },
  },
  methods: {
    startEdit(tmpl) {
      this.editingId = tmpl.id;
      this.form = { name: tmpl.name, startTime: tmpl.startTime, endTime: tmpl.endTime };
      this.formError = '';
    },
    cancelEdit() {
      this.editingId = null;
      this.form = { ...EMPTY_FORM };
      this.formError = '';
    },
    async handleSubmit() {
      this.saving = true;
      this.formError = '';
      try {
        if (this.editingId) {
          await adminScheduleService.updateTemplate(this.editingId, this.form);
        } else {
          await adminScheduleService.createTemplate(this.form);
        }
        this.form = { ...EMPTY_FORM };
        this.editingId = null;
        this.$emit('updated');
      } catch (err) {
        this.formError = err.response?.data?.msg || 'Failed to save template';
      } finally {
        this.saving = false;
      }
    },
    async handleRestoreDefaults() {
      this.restoring = true;
      this.formError = '';
      try {
        await adminScheduleService.restoreDefaultTemplates();
        this.$emit('updated');
      } catch (err) {
        this.formError = err.response?.data?.msg || 'Failed to restore defaults';
      } finally {
        this.restoring = false;
      }
    },
    async handleDelete(id) {
      try {
        await adminScheduleService.deleteTemplate(id);
        this.$emit('updated');
      } catch (err) {
        this.formError = err.response?.data?.msg || 'Failed to delete template';
      }
    },
  },
};
</script>
