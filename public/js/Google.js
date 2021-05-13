let auth2 = {};

function renderUserInfo(googleUser, htmlElmId) {
  const profile = googleUser.getBasicProfile();

  const htmlStringEn = `
  <p>User logged in.</p>
  <ul>
      <li> ID: ${profile.getId()}
      <li>  Full name: ${profile.getName()}
      <li>  Given name: ${profile.getGivenName()}
      <li>  Family name: ${profile.getFamilyName()}
      <li>  Image URL: ${profile.getImageUrl()}
      <li>  Email: ${profile.getEmail()}
  </ul>
        `;
  document.getElementById(htmlElmId).innerHTML = htmlStringEn;
}

function renderLogOutInfo(htmlElmId) {
  const htmlString = `
                <p>User not signed in</p>
                `;
  document.getElementById(htmlElmId).innerHTML = htmlString;
}

function signOut() {
  if (auth2.signOut) {
    auth2.signOut();
  }
  if (auth2.disconnect) {
    auth2.disconnect();
  }
}

function userChanged(user) {
  document.getElementById("userName").innerHTML = user
    .getBasicProfile()
    .getName();

  const userInfoElm = document.getElementById("userStatus");
  const userNameInputElm = document.getElementById("name");
  if (userNameInputElm) {
    userNameInputElm.value = user.getBasicProfile().getName();
  } else if (userInfoElm) {
    renderUserInfo(user, "userStatus");
  }
}

function updateSignIn() {
  const sgnd = auth2.isSignedIn.get();
  if (sgnd) {
    document.getElementById("SignInButton").classList.add("hiddenElm");
    document.getElementById("SignedIn").classList.remove("hiddenElm");
    document.getElementById("userName").innerHTML = auth2.currentUser
      .get()
      .getBasicProfile()
      .getName();
  } else {
    document.getElementById("SignInButton").classList.remove("hiddenElm");
    document.getElementById("SignedIn").classList.add("hiddenElm");
  }

  const userInfoElm = document.getElementById("userStatus");
  const userNameInputElm = document.getElementById("name");
  if (userNameInputElm) {
    if (sgnd) {
      userNameInputElm.value = auth2.currentUser
        .get()
        .getBasicProfile()
        .getName();
    } else {
      userNameInputElm.value = "";
    }
  } else if (userInfoElm) {
    if (sgnd) {
      renderUserInfo(auth2.currentUser.get(), "userStatus");
    } else {
      renderLogOutInfo("userStatus");
    }
  }
}

function startGSingIn() {
  gapi.load("auth2", function () {
    gapi.signin2.render("SignInButton", {
      width: 240,
      height: 50,
      longtitle: true,
      theme: "dark",
      onsuccess: onSuccess,
      onfailure: onFailure,
    });
    gapi.auth2.init().then(function () {
      console.log("init");
      auth2 = gapi.auth2.getAuthInstance();
      auth2.currentUser.listen(userChanged);
      auth2.isSignedIn.listen(updateSignIn);
      auth2.then(updateSignIn);
    });
  });
}

function onSuccess(googleUser) {
  console.log("Logged in as: " + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
  console.log(error);
}
