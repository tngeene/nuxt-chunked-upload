export const getters = {
    isAuthenticated(state) {
      return state.auth.loggedIn // checks if a user is logged in
    },
  
    loggedInUser(state) {
      return state.auth.user // gets details of logged in user, returns null if no user is logged in
    }
  }
  
  export default {
    getters
  }

  