import Mustache from "./mustache.js";

export default class OpinionsHandler {
  /**
   * constructor
   * @param opinionsFormElmId - id of a form element where a new visitor opinion is entered
   * @param opinionsListElmId - id of a html element to which the list of visitor opinions is rendered
   */
  constructor(opinionsFormElmId, opinionsListElmId) {
    this.opinions = [];

    this.opinionsElm = document.getElementById(opinionsListElmId);
    this.opinionsFrmElm = document.getElementById("opnFrm");
  }

  /**
   * initialisation of the list of visitor opinions and form submit setup
   */
  init() {
    if (localStorage.commentStorage) {
      this.opinions = JSON.parse(localStorage.commentStorage);
      var template = document.getElementById("template").innerHTML;
      var text = Mustache.render(template, { data: this.opinions });
      document.getElementById("target").innerHTML = text;
    }
    this.opinionsFrmElm.addEventListener("submit", (event) =>
      this.processOpnFrmData(event)
    );
  }

  /**
   * Processing of the form data with a new visitor opinion
   * @param event - event object, used to prevent normal event (form sending) processing
   */
  processOpnFrmData(event) {
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const nopName = this.opinionsFrmElm.elements["name"].value.trim(); // this.opinionsFrmElm.elements["login"] can be used, too
    const nopGender = this.opinionsFrmElm.elements["gender"].value.trim();
    const nopCell = this.opinionsFrmElm.elements["cell"].value.trim();
    const nopEmail = this.opinionsFrmElm.elements["email"].value.trim();
    const nopUrl = this.opinionsFrmElm.elements["url"].value.trim();
    const nopMessage = this.opinionsFrmElm.elements["message"].value.trim();
    const nopOccupationСhoice = this.opinionsFrmElm.elements[
      "occupationСhoice"
    ].value.trim();
    const nopMarkSite = this.opinionsFrmElm.elements["markSite"].value.trim();

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
      gender: nopGender,
      cell: nopCell,
      email: nopEmail,
      url: nopUrl,
      occupationСhoice: nopOccupationСhoice,
      markSite: nopMarkSite,
      created: new Date(),
    };

    console.log("New opinion:\n " + JSON.stringify(newOpinion));

    this.opinions.push(newOpinion); //vlazhivau v massiv

    localStorage.commentStorage = JSON.stringify(this.opinions);

    //4. Update HTML
    window.alert("Opinion has been stored.");
    console.log(this.opinions);

    var template = document.getElementById("template").innerHTML;
    var text = Mustache.render(template, { data: this.opinions });
    console.log(text);
    document.getElementById("target").innerHTML = text;

    //5. Reset the form
    this.opinionsFrmElm.reset(); //resets the form
  }
}
