/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";

function createHtml4opinions(targetElm) {
  const opinionsFromStorage = localStorage.myTreesComments;
  let opinions = [];

  if (opinionsFromStorage) {
    opinions = JSON.parse(opinionsFromStorage);
    opinions.forEach((opinion) => {
      opinion.created = new Date(opinion.created).toDateString();
      opinion.willReturn = opinion.willReturn
        ? "I will return to this page."
        : "Sorry, one visit was enough.";
    });
  }

  document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById("template-opinions").innerHTML,
    opinions
  );
}

//an array, defining the routes
export default [
  {
    //the part after '#' in the url (so-called fragment):
    hash: "welcome",
    ///id of the target html element:
    target: "router-view",
    //the function that returns content to be rendered to the target html element:
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-welcome"
      ).innerHTML),
  },
  {
    hash: "articles",
    target: "router-view",
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-articles"
      ).innerHTML),
  },
  {
    hash: "opinions",
    target: "router-view",
    getTemplate: createHtml4opinions,
  },
  {
    hash: "addOpinion",
    target: "router-view",
    getTemplate: (targetElm) => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-addOpinion"
      ).innerHTML;
      document.getElementById("opnFrm").onsubmit = processOpnFrmData;
    },
  },
];

function fetchAndDisplayArticles(targetElm) {
  const serverUrl = "https://wt.kpi.fei.tuke.sk/api/article";
  const errorElm = document.getElementById("template-articles-error");

  let articleList = [];
  //fetch sdelat' zapros na site
  fetch(serverUrl) //there may be a second parameter, an object wih options, but we do not need it now.
    .then((response) => {
      if (response.ok) {
        //if ok - return json file s articlami
        return response.json();
      } else {
        //Mu sozdaem oshibky
        return Promise.reject(
          new Error(
            `Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`
          )
        ); //we return a rejected promise to be catched later
      }
    })
    .then((responseJSON) => {
      //perenosim dannie s json v mustache, renderim i vstavlaem v template article
      articleList = responseJSON.articles; //to 4to vernul then == pam v sled then
      console.log(JSON.stringify(articleList));
      return Promise.resolve(); //Method Promise.resolve(value) return Promise with entered value.
    })
    .then(() => {
      //bez parametra
      let contentRequests = articleList.map(
        //sozdaem masiv zaprosov na server
        (article) => fetch(`${serverUrl}/${article.id}`)
      );

      return Promise.all(contentRequests); //Try to resolve all promises
    })
    .then((responses) => {
      //to 4to promise all vernet,zapishet'sa v responses
      let failed = "";
      for (let response of responses) {
        if (!response.ok) failed += response.url + " "; //write massiv springov v vide url, v kotorom ne proshel response
      }
      if (failed === "") {
        return responses; //Sozdaem ashibku s naborom urlov 4erez probel.
      } else {
        return Promise.reject(
          new Error(
            `Failed to access the content of the articles with urls ${failed}.`
          )
        );
      }
    })
    .then((responses) => Promise.all(responses.map((resp) => resp.json()))) //Dostaem telo kazdogo otveta
    .then((articles) => {
      articles.forEach((article, index) => {
        //V kazdiy article add content
        articleList[index].content = article.content;
      });
      console.log(JSON.stringify(articleList)); //v console vipishem vse v string
      return Promise.resolve();
    })
    .then(() => {
      renderArticles(articleList);
    })
    .catch((error) => errorHandler && errorHandler(error));

  function errorHandler(error) {
    errorElm.innerHTML = `Error reading data from the server. ${error}`; //write an error message to the page
    console.log(error);
  }

  function renderArticles(articles) {
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById("template-articles").innerHTML,
      articles
    ); //write some of the response object content to the page using Mustache
    // console.log('KU');
    console.log(articles);
  }
}
