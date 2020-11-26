// ==UserScript==
// @name         Youtube Date Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add the time since a youtube video was published next to the date
// @author       Zack Sargent
// @match        https://www.youtube.com/*
// ==/UserScript==

// DATE_ELEMENT_INDEX can be obtained by manually looking through
// the DOM. I considered dynamically finding the date element, but
// keeping a constant index seems quicker, and has worked for several months.
const DATE_ELEMENT_INDEX = 14;
var dateText = "";

window.setInterval(() => {
    // I set a constant checker on every youtube page,
    // because most youtube transitions do not reload the page.
    if (window.location.href.includes("watch")) {
        let dateElement = document.getElementsByClassName("style-scope ytd-video-primary-info-renderer");
        let dateContent = dateElement[DATE_ELEMENT_INDEX].textContent;
        if (dateContent != dateText) {
            replaceText();
        }
    }
}, 1000)

function replaceText() {
    let x = document.getElementsByClassName("style-scope ytd-video-primary-info-renderer");
    let publishedDate = x[DATE_ELEMENT_INDEX].textContent;

    if (publishedDate.includes("Released")) {
        // slice correct date, because youtube does not reload the page when clicking on next video
        if (publishedDate.includes("ago")) {
            publishedDate = publishedDate.slice(publishedDate.indexOf("ago") + 3);
        } else if (publishedDate.includes("today")) {
            publishedDate = publishedDate.slice(publishedDate.indexOf("today") + 5);
        }
    }

    let differenceText = getDifferenceText(publishedDate);

    let newTitle = publishedDate + differenceText;
    x[DATE_ELEMENT_INDEX].textContent = newTitle;
    dateText = newTitle;
}

function getDifferenceText(start) {
    let publishedDate = Date.parse(start);
    if (publishedDate == null || publishedDate == "") {
        return "";
    }

    let timeDelta = Date.now() - publishedDate;

    return " • Released " + secondsToYMD(timeDelta / 1000);
}

function secondsToYMD(seconds) {
    seconds = Number(seconds);
    let secondsInADay   = 60 * 60 * 24;
    let secondsInAMonth = secondsInADay * 30.416666; // average days in a month
    let secondsInAYear  = secondsInADay * 364.99999; // average days in a year

    let years  = Math.floor(seconds / secondsInAYear);
    seconds -= years * secondsInAYear;
    let months = Math.floor(seconds / secondsInAMonth);
    seconds -= months * secondsInAMonth;
    let days   = Math.floor(seconds / secondsInADay);

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
