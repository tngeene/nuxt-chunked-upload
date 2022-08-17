<template>
  <section class="section">
    <div class="columns is-mobile">
      <LargeFileForm />
    </div>
  </section>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      uploadStatus: 'Submit File',
    }
  },
}
</script>
