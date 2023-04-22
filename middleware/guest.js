// middleware for restricting login page logged in users

export default function({ store, redirect }) {
    if (store.state.auth.loggedIn) {
      return redirect('/')
    }
  }