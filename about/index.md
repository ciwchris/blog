---
layout: layouts/page.njk
title: About
templateClass: tmpl-page
eleventyNavigation:
  key: About
  order: 3
---

### About me

Software developer professional. Dog lover. Pacific Northwest explorer.

### License / attribution

All content is under [Creative Commons CC-BY-SA license](https://creativecommons.org/licenses/by-sa/4.0/), unless stated otherwise.

### About this website

This site is built with [Eleventy](https://www.11ty.dev/). Content and other tools used [can be viewed on GitHub](https://github.com/ciwchris/blog).

### Contact

Questions? Comments? Feel free to contact me at <a class="eml-protected" href="#">57343f253e242338273f3225793b3827322417273a793a32</a>

<script>
// https://dev.to/andrewlocknet/adding-simple-email-address-obfuscation-for-your-blog-like-cloudflare-scrape-shield-40f7
// Find all the elements on the page that use class="eml-protected"
var allElements = document.getElementsByClassName("eml-protected");

// Loop through all the elements, and update them
for (var i = 0; i < allElements.length; i++) {
    updateAnchor(allElements[i])
}

function updateAnchor(el) {
    // fetch the hex-encoded string
    var encoded = el.innerHTML;

    // decode the email, using the decodeEmail() function from before
    var decoded = decodeEmail(encoded);

    // Replace the text (displayed) content
    el.textContent = decoded;

    // Set the link to be a "mailto:" link
    el.href = 'mailto:' + decoded;
}

function decodeEmail(encodedString) {
    // Holds the final output
    var email = "";

    // Extract the first 2 letters
    var keyInHex = encodedString.substr(0, 2);

    // Convert the hex-encoded key into decimal
    var key = parseInt(keyInHex, 16);

    // Loop through the remaining encoded characters in steps of 2
    for (var n = 2; n < encodedString.length; n += 2) {

        // Get the next pair of characters
        var charInHex = encodedString.substr(n, 2)

        // Convert hex to decimal
        var char = parseInt(charInHex, 16);

        // XOR the character with the key to get the original character
        var output = char ^ key;

        // Append the decoded character to the output
        email += String.fromCharCode(output);
    }
    return email;
}

</script>
