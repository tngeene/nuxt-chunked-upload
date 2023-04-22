<template>
  <form action="post" @submit.prevent="login">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Login</p>
        <button type="button" class="delete" @click="$emit('close')" />
      </header>
      <section class="modal-card-body">
        <b-field label="Email">
          <b-input
            type="email"
            placeholder="Your email"
            required
          >
          </b-input>
        </b-field>

        <b-field label="Password">
          <b-input
            type="password"
            :value="password"
            password-reveal
            placeholder="Your password"
            required
          >
          </b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button label="Close" @click="$emit('close')" />
        <b-button label="Login" type="is-primary submit" />
      </footer>
    </div>
  </form>
</template>

<script>

export default {
  name: 'LoginForm',
  middleware: 'guest',
  data() {
    return {
      username: null,
      password: null,
    }
  },
  methods: {
    snackbar(messageStr, snackBarType) {
      this.$buefy.snackbar.open({
        message: messageStr,
        position: 'is-top-right',
        type: snackBarType,
        duration: 6000,
        actionText: 'Retry',
      })
    },
  async login() {
      try {
        this.snackbar('Logging in...', 'is-info')
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        this.snackbar('Login Successful', 'is-success')
        this.window.location.reload()
      } catch (e) {
        this.snackbar('Unable to login with provided credentials', 'is-danger')
      }
    }
}
}
</script>
