<template>
<section>
    <div class="buttons">
            <b-button
                label="Login"
                type="is-primary"
                size="is-medium"
                @click="cardModal" />
        </div>
</section>
</template>


<script>
export default {
  name: 'LoginButton',
  methods: {
    cardModal() {
      this.$buefy.modal.open({
        parent: this,
        component: ModalForm,
        hasModalCard: true,
        customClass: 'custom-class custom-class-2',
        trapFocus: true,
      })
    },
  },
}
</script>