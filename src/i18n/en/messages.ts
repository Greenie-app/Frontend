const en: Record<string, any> = {
  unknownPilot: "(unknown)",
  footer: {
    copyright: "Copyright ©2020 Tim “Stretch” Morgan.",
    contributeLink: "Contribute to the source code on GitHub.",
  },
  navbar: {
    logOut: "Log Out",
    logIn: "Log In",
    editSquadron: "Edit My Squadron",
    changePassword: "Change Password",
  },
  home: {
    jumbotron: {
      header: "Greenie.app",
      lead: "A greenie board for your virtual DCS squadron",
      description:
        "Greenie.app is a “greenie board” that records your pilots’ traps and bolters, " +
        "and presents them in a grid where pilots can track trends and keep score. You can add your " +
        "passes manually, or upload your dcs.log files to add them automatically.",
    },
    signUpButton: "Add My Squadron",
    signUp: {
      header: "Add Your Squadron",
      fields: {
        name: "Your squadron's name:",
        username: "Choose a login name for your squadron:",
        image: "Upload your squadron's insignia:",
        email: "Your email address (for when you forget your password):",
        password: "Choose a password for your squadron:",
        passwordConfirmation: "Type it again, just to be sure:",
      },
      selectImage: "Select Image",
      submitButton: "Create Squadron Account",
      help:
        "Your entire squadron will share one login and password. Anyone can use that login and " +
        "password to add passes to the Greenie Board, or upload dcs.log files. You don't need to " +
        "know the login and password to view the Greenie Board.",
    },
  },
  logIn: {
    header: "Log in to your virtual squadron",
    usernamePlaceholder: "squadron username",
    passwordPlaceholder: "squadron password",
    logInButton: "Log In",
    rememberMe: "Remember me",
    help:
      "You only need to log in to add your passes or upload log files. Don’t know your " +
      "squadron’s login or password? Ask your squadron CO.",
    forgotPassword: "I forgot my password :(",
  },
  changePassword: {
    header: "Change your squadron password",
    currentPasswordPlaceholder: "current password",
    newPasswordPlaceholder: "new password",
    confirmationPlaceholder: "again",
    button: "Change Password",
    success: "Your squadron password has been updated.",
  },
  editSquadron: {
    header: "Edit your squadron",
    submitButton: "Update Squadron",
    deleteButton: "Delete Squadron",
    confirmDelete: {
      title: "Confirm Delete",
      text: "Are you sure you want to delete {0}?",
      okButton: "Delete",
      cancelButton: "Cancel",
    },
  },
  mustBeLoggedIn: "You must log in to your squadron first.",
  mustBeLoggedOut: "You must log out of your squadron first.",
  forgotPassword: {
    title: "Forgot your password?",
    text:
      "That’s OK. Give me your email address and I’ll email you a link you can use to reset your" +
      " password.",
    placeholder: "email address",
    submitButton: "Send Email",
    success: "Password reset email sent. Check your inbox!",
  },
  resetPassword: {
    title: "Reset your password",
    successMessage: "Your password has been reset. Please log in again.",
    badToken: "The Reset Password link you used is invalid or expired.",
  },
  error: {
    title: "Sorry, an error occurred.",
  },
  squadronBoard: {
    title: "{0} Greenie Board",
    addPassButton: "Add Pass",
    uploadButton: "Upload dcs.log",
    noPasses: "No passes yet.",
    deleteAll: {
      link: "delete all passes with unknown pilots",
      title: "Delete Passes",
      confirm: {
        message:
          "This will permanently delete approx. {count} passes with unknown pilots. Continue?",
        okButton: "Delete All",
      },
      error: {
        message: "An error occurred when trying to delete all passes with unknown pilots.",
        okButton: "OK",
      },
    },
    boardingRate: "Boarding rate: {0}",
    pilotAndScore: "{name} ({score})",
  },
  uploadModal: {
    title: "Upload dcs.log file",
    uploadButton: "Upload",
    placeholder: "logfile",
    logfile: {
      title: "{date} ({size})",
      state: {
        pending: "Pending",
        in_progress: "Processing…",
        complete: "Finished",
        failed: "Failed",
      },
    },
  },
  addPassModal: {
    title: "Add Pass",
    submitButton: "Add",
  },
  editPassModal: {
    submitButton: "Update",
    title: "Edit Pass",
    deleteButton: "Delete Pass",
  },
  passModal: {
    fields: {
      time: "Time (UTC):",
      shipName: "Carrier Name (e.g., “CVN-72”):",
      aircraftType: "Aircraft Type:",
      score: "Score:",
      pilot: "Pilot:",
      grade: "Grade:",
      wire: "Wire:",
      notes: "Notes:",
      trap: "Count this pass towards boarding rate?",
    },
    grades: {
      "": "",
      cut: "C — Cut Pass",
      no_grade: "No Grade",
      bolter: "B — Bolter",
      fair: "(OK) — Fair",
      ok: "OK",
      perfect: "_OK_ — Perfect",
      technique_waveoff: "Waveoff: Technique",
      foul_deck_waveoff: "Waveoff: Foul Deck",
      pattern_waveoff: "Waveoff: Pattern",
      own_waveoff: "Own Waveoff",
    },
    trap: {
      null: "This pass does not contribute to or against boarding rate",
      true: "This pass counts as a trap (towards boarding rate)",
      false: "This pass counts as a miss (against boarding rate)",
    },
  },
  pass: {
    grade: {
      cut: "C",
      no_grade: "—",
      bolter: "B",
      fair: "(OK)",
      ok: "OK",
      perfect: "_OK_",
      technique_waveoff: "WO",
      foul_deck_waveoff: "WO",
      pattern_waveoff: "WO",
      own_waveoff: "OWO",
    },
  },
  notFound: {
    header: "Not Found",
    message:
      "Sorry, but you navigated somewhere that either never existed, or doesn’t exist anymore.",
  },
  pilotBoard: {
    tableHeaders: {
      time: "Time",
      shipName: "Ship",
      aircraftType: "Aircraft",
      grade: "Grade",
      score: "Score",
      wire: "Wire",
      notes: "Notes",
    },
    zuluTime: "{time}Z",
    actions: {
      rename: "Rename",
      merge: "Merge Into…",
      delete: "Delete Pilot",
    },
    renameModal: {
      title: "Rename Pilot",
      message: "Rename {oldName} to:",
      submit: "Rename",
    },
    mergeConfirmModal: {
      title: "Confirm Merge",
      message:
        "Are you sure you want to merge {prey} into {predator}? All of {prey}’s passes will" +
        " now belong to {predator}, and {prey} will be deleted.",
      okButton: "Merge Pilots",
    },
    deleteConfirmModal: {
      title: "Confirm Delete",
      message: "Are you sure you want to delete {0} and all their passes?",
      okButton: "Delete",
    },
  },
  errorModal: "Error",
};
export default en;
