// /*
//  * routes definition and handling for paramHashRouter
//  */
import Mustache from "./mustache.js";
// import processOpnFrmData from "./addOpinion.js";

//an array, defining the routes
export default [
  {
    //the part after '#' in the url (so-called fragment):
    hash: "welcome",
    ///id of the target html element:
    target: "router-view",
    //the function that returns content to be rendered to the target html element:
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML =
        document.getElementById("template-welcome").innerHTML),
  },
  {
    hash: "articles",
    target: "router-view",
    getTemplate: fetchAndDisplayArticles,
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
  {
    hash: "article",
    target: "router-view",
    getTemplate: fetchAndDisplayArticleDetail,
  },
  {
    hash: "artEdit",
    target: "router-view",
    getTemplate: editArticle,
  },
  {
    hash: "artInsert",
    target: "router-view",
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-insertArticle"
      ).innerHTML),
  },
];

function createHtml4opinions(targetElm) {
  const opinionsFromStorage = localStorage.commentsStorage;
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

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

function fetchAndDisplayArticles(
  targetElm,
  offsetFromHash,
  totalCountFromHash
) {
  const offset = Number(offsetFromHash);
  const totalCount = Number(totalCountFromHash);

  let urlQuery = "";

  if (offset && totalCount) {
    urlQuery = `?offset=${offset}&max=${articlesPerPage}`;
  } else {
    urlQuery = `?max=${articlesPerPage}`;
  }

  const url = `${urlBase}/article${urlQuery}`;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then((responseJSON) => {
      addArtDetailLink2ResponseJson(responseJSON);
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles").innerHTML,
        responseJSON
      );
    })
    .catch((error) => {
      ////here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    });
}

function addArtDetailLink2ResponseJson(responseJSON) {
  responseJSON.articles = responseJSON.articles.map((article) => ({
    ...article,
    detailLink: `#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`,
  }));
}

function fetchAndDisplayArticleDetail(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, false);
}

/**
 * Gets an article record from a server and processes it to html according to
 * the value of the forEdit parameter. Assumes existence of the urlBase global variable
 * with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates )
 * with id="template-article" (if forEdit=false) and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record
 *                    will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using
 *                            the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */

function editArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, true);
}
function insertArtiformSubmitCallcle(targetElm) {
  alert("insert article");
  //createAndProcessArticle();
}

function fetchAndProcessArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash,
  forEdit
) {
  const url = `${urlBase}/article/${artIdFromHash}`;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then((responseJSON) => {
      if (forEdit) {
        responseJSON.formTitle = "Article Edit";
        responseJSON.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},
                                         ${totalCountFromHash},'${urlBase}')`;
        responseJSON.submitBtTitle = "Save article";
        responseJSON.urlBase = urlBase;
        responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
        document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById("template-article-form").innerHTML,
          responseJSON
        );
      } else {
        responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
        responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
        responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

        document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById("template-article").innerHTML,
          responseJSON
        );
      }
    })
    .catch((error) => {
      ////here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    });
}
