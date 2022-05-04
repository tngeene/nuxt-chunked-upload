<template>
  <b-form method="post" class="form" @submit.prevent="emit('upload-file')">
    <b-field :label="label">
      <b-field
        class="file is-primary"
        :class="{ 'has-name': !!file }"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        @change="$emit('create-file-hash')">
        <b-upload :value="file" class="file-label" rounded>
          <span class="file-cta">
            <b-icon class="file-icon" icon="upload"></b-icon>
            <span class="file-label">{{ uploadStatus }}</span>
          </span>
          <span v-if="file" class="file-name">
            {{ file.name }}
          </span>
        </b-upload>
      </b-field>
    </b-field>
  </b-form>
</template>

<script>
export default {
  name: 'LargeFileForm',
  props: {
    submitting: {
      type: Boolean,
      default: false,
    },
    file: {
      type: Object,
      default: null,
    },
    label: {
      type: String,
      default: 'Upload File',
    },
    uploadStatus: {
      type: String,
      default: 'Click to upload file',
    },
  },
}
</script>
