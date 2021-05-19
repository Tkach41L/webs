export default function processOpnFrmData(event) {
  //1.prevent normal event (form sending) processing
  event.preventDefault();

  //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
  const nopName = document.getElementById("name").value.trim();
  const nopGender = document.getElementById("male").value.trim();
  const nopCell = document.getElementById("cell").value.trim();
  const nopEmail = document.getElementById("email").value.trim();
  const nopUrl = document.getElementById("url").value.trim();
  const nopMessage = document.getElementById("message").value.trim();
  const nopOccupationСhoice = document
    .getElementById("occupationСhoice")
    .value.trim();
  const nopMarkSite = document.getElementById("markSite").value.trim();

  //3. Verify the data
  if (
    nopName == "" ||
    nopGender == "" ||
    nopEmail == "" ||
    nopMessage == "" ||
    nopOccupationСhoice == ""
  ) {
    window.alert("Please, enter all fields");
    return;
  }

  //3. Add the data to the array opinions and local storage
  const newOpinion = {
    name: nopName,
    message: nopMessage,
    male: nopGender,
    cell: nopCell,
    email: nopEmail,
    url: nopUrl,
    occupationСhoice: nopOccupationСhoice,
    markSite: nopMarkSite,
    created: new Date(),
  };

  console.log("New opinion:\n " + JSON.stringify(newOpinion));

  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": "VFdVT83jOBJj17B4r1TrpaiUllgCYXkBh4XQEOiO",
      "X-Parse-REST-API-Key": "kGvUqi793R22kDWJMhFyfk6SMPrmeuVBQggN4G05",
    },
    body: JSON.stringify(newOpinion),
  };

  const url = "https://parseapi.back4app.com/classes/App";

  fetch(url, request).then((response) => {
    console.log(response);
  });

  //5. Go to the opinions
  window.location.hash = "#opinions";
}
