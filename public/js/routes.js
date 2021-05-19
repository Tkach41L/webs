/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from './mustache.js';
import processOpnFrmData from './addOpinion.js';
import articleFormsHandler from './articleFormsHandler.js';
import createAndProcessArticle from './addArticle.js';


//an array, defining the routes
export default [
    {
        //the part after '#' in the url (so-called fragment):
        hash: 'welcome',
        ///id of the target html element
        target: 'router-view',
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            (document.getElementById(targetElm).innerHTML =
                document.getElementById('template-welcome').innerHTML),
    },
    {
        hash: 'articles',
        target: 'router-view',
        getTemplate: fetchAndDisplayArticles,
    },
    {
        hash: 'opinions',
        target: 'router-view',
        getTemplate: createHtml4opinions,
    },
    {
        hash: 'addOpinion',
        target: 'router-view',
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML =
                document.getElementById('template-addOpinion').innerHTML;
            document.getElementById('form4Index').onsubmit = processOpnFrmData;
        },
    },

    {
        hash: 'article',
        target: 'router-view',
        getTemplate: fetchAndDisplayArticleDetail,
    },

    {
        hash: 'artEdit',
        target: 'router-view',
        getTemplate: editArticle,
    },

    {
        hash: 'artDelete',
        target: 'router-view',
        getTemplate: deleteArticle,
    },

    {
        hash: 'artInsert',
        target: 'router-view',
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML =
                document.getElementById('template-insertArticle').innerHTML;
            createAndProcessArticle();
        },
    }, //added
];

const urlBase = 'https://wt.kpi.fei.tuke.sk/api';
const articlesPerPage = 20;

function createHtml4opinions(targetElm) {
    // Fetch from DB

    const url = 'https://parseapi.back4app.com/classes/App';
    const request = {
        method: 'GET',
        headers: {
            'X-Parse-Application-Id': 'VFdVT83jOBJj17B4r1TrpaiUllgCYXkBh4XQEOiO',
            'X-Parse-REST-API-Key': 'kGvUqi793R22kDWJMhFyfk6SMPrmeuVBQggN4G05',
        },
    };

    fetch(url, request)
        .then((response) => {
            return response.json();
        })
        .then((resJSON) => {
            const opinionsFromStorage = resJSON.results;
            let opinions = [];

            if (opinionsFromStorage) {
                opinions = opinionsFromStorage;
                opinions.forEach((opinion) => {
                    opinion.created = new Date(opinion.created).toDateString();
                    opinion.willReturn = opinion.willReturn
                        ? 'I will return to this page.'
                        : 'Sorry, one visit was enough.';
                });
            }
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById('template-opinions').innerHTML,
                opinions
            );
        })
        .catch((e) => {
            console.log(e);
        });
}

function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash) {
    const offset = Number(offsetFromHash);
    const totalCount = Number(totalCountFromHash);

    let urlQuery = '';

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
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`)
                );
            }
        })
        .then((responseJSON) => {
            addArtDetailLink2ResponseJson(responseJSON);
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById('template-articles').innerHTML,
                responseJSON
            );
        })
        .catch((error) => {
            ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById('template-articles-error').innerHTML,
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

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, true);
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
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`)
                );
            }
        })
        .then((responseJSON) => {
            if (forEdit) {
                responseJSON.formTitle = 'Article Edit';
                responseJSON.submitBtTitle = 'Save article';
                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.formSubmitCall =
                    //added
                    `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},
                                         ${totalCountFromHash},'${urlBase}')`;
                responseJSON.urlBase = urlBase; //added

                document.getElementById(targetElm).innerHTML = Mustache.render(
                    document.getElementById('template-article-form').innerHTML,
                    responseJSON
                );
                if (!window.artFrmHandler) {
                    window.artFrmHandler = new articleFormsHandler(
                        'https://wt.kpi.fei.tuke.sk/api'
                    );
                }
                window.artFrmHandler.assignFormAndArticle(
                    'articleForm',
                    'hiddenElm',
                    artIdFromHash,
                    offsetFromHash,
                    totalCountFromHash
                );
            } else {
                responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`; //added
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                fetch(`${url}/comment`).then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        //if we get server error
                        return Promise.reject(
                            new Error(`Server answered with ${response.status}: ${response.statusText}.`)
                        );
                    }

                }).then((commentsJSON) => {
                    responseJSON.comments = commentsJSON.comments;

                    document.getElementById(targetElm).innerHTML = Mustache.render(
                        document.getElementById('template-article').innerHTML,
                        responseJSON
                    ); //added

                    if(auth2.isSignedIn.get()) {
                        document.getElementById('comment_author').value
                            = auth2.currentUser.get().getBasicProfile().getName();//if signin to add v comment author user name
                    }

                    document.getElementById('add_comment').onclick = () => {
                        addComment(artIdFromHash);
                    }

                });


            }
        })
        .catch((error) => {
            ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById('template-articles-error').innerHTML,
                errMsgObj
            );
        });
}

const serverUrlBase = 'https://wt.kpi.fei.tuke.sk/api';

//----------------------------------------------------------------------------------------------------------------
//command executed when the page loads

//Pridanie funkcionality pre kliknutie na tlacidlo "Pridaj článok / Add article"
//Adding functionality for the button "Pridaj článok / Add article"
// document.getElementById("template-article").addEventListener("submit",event =>{
//         event.preventDefault();
//         deleteArticle("serverResponse",serverUrlBase);
//     }
// );

//----------------------------------------------------------------------------------------------------------------
//request implemented using Fetch API

/**
 * Collects data from the form, sends it as a new article to the server and displays the result to
 * the element with id=outputEmlId
 * @param outputEmlId - id of the element where the result of the request execution will be displayed.
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api
 */
function deleteArticle(outputEmlId, artIdFromHash) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    const outpElm = document.getElementById(outputEmlId);

    //1. Get id from the form

    const id2Delete = artIdFromHash;

    //2. Set up the request

    const deleteReqSettings =
        //an object wih settings of the request
        {
            method: 'DELETE',
        };

    //3. Execute the request

    outpElm.innerHTML = `Attempting to delete article with id=${id2Delete}<br />... <br /> <br />`;

    fetch(`${urlBase}/article/${id2Delete}`, deleteReqSettings) //now we need the second parameter, an object wih settings of the request.
        .then((response) => {
            //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {
                //successful execution includes an error response from the server. So we have to check the return status of the response here.
                outpElm.innerHTML += `Article successfully deleted.`; //no response this time, so we end here
            } else {
                //if we get server error
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`)
                ); //we return a rejected promise to be catched later
            }
        })
        .catch((error) => {
            ////here we process all the failed promises
            outpElm.innerHTML += `Attempt failed. Details: <br />  ${error}`;
        });
}


function addComment(artIdFromHash) {



    const commentAuthor
        = document.getElementById('comment_author').value.trim();
    const commentText
        = document.getElementById('comment_text').value.trim();
    console.log(commentAuthor, commentText);

    const url = `${urlBase}/article/${artIdFromHash}/comment`;

    fetch(url, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'text': commentText,
            'author': commentAuthor,
        }),
    }).then(response => {
        document.getElementById('comment-section').innerHTML += `
            <p>
            by ${commentAuthor}
            </p>

            <li>${commentText}</li>
        `;

    });
}