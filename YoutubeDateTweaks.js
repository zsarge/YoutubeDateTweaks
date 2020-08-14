// ==UserScript==
// @name         Youtube Date Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

const dateElementIndex = 14;
var dateText = "";

window.setInterval(() => {
    // I set a constant checker on every youtube page,
    // because most youtube transitions do not reload the page.
    if (window.location.href.includes("watch")) {
        let dateElement = document.getElementsByClassName("style-scope ytd-video-primary-info-renderer");
        let dateContent = dateElement[dateElementIndex].textContent;
        if (dateContent != dateText) {
            replaceText();
        }
    }
}, 1000)

function replaceText() {
    let x = document.getElementsByClassName("style-scope ytd-video-primary-info-renderer");
    let publishedDate = x[dateElementIndex].textContent;

    if (publishedDate.includes("Released")) {
        // slice correct date, because youtube does not reload the page when clicking on next video
        if (publishedDate.includes("ago")) {
            publishedDate = publishedDate.slice(publishedDate.indexOf("ago") + 3);
        } else if (publishedDate.includes("today")) {
            publishedDate = publishedDate.slice(publishedDate.indexOf("today") + 5);
        }
    }

    let timeDifference = getTimeDifference(publishedDate);

    let newTitle = publishedDate + timeDifference;
    x[dateElementIndex].textContent = newTitle;
    dateText = newTitle;
}

function getTimeDifference(start) {
    let publishedDate = Date.parse(start);
    if (publishedDate == null || publishedDate == "") {
        return "";
    }

    let timeDelta = Date.now() - publishedDate;
    let dateobject = new Date(timeDelta);

    return " • Released " + secondsToYMD(timeDelta / 1000);
}

function secondsToYMD(seconds) {
    seconds = Number(seconds);
    let secondsInADay   = 3600 * 24;
    let secondsInAMonth = secondsInADay * 30; // approximate months
    let secondsInAYear  = secondsInADay * 365;

    let years  = Math.floor(seconds / secondsInAYear);
    seconds -= years * secondsInAYear;
    let months = Math.floor(seconds / secondsInAMonth);
    seconds -= months * secondsInAMonth;
    let days   = Math.floor(seconds / secondsInADay);

    // Is this an abuse of ternary operators?
    // Yes, absolutely
    let dayString   = days   > 0 ? days   + (days   == 1 ? " day "   : " days "  ) : "";
    let monthString = months > 0 ? months + (months == 1 ? " month " : " months ") : "";
    let yearString  = years  > 0 ? years  + (years  == 1 ? " year "  : " years " ) : "";

    let result = yearString + monthString + dayString;
    if (result == "") {
        result = "today";
    } else {
        result += " ago";
    }
    return result
}
