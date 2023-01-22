---
layout: layouts/page.njk
permalink: /about/
title: About
templateClass: tmpl-page
date: 2010-01-01
eleventyNavigation:
  key: About
  order: 1
---

### About me

I'm a dog lover and [adopted a dog](http://PETHUB.ME/SPK-701172) which joins me as I [explore the Pacific Northwest](https://www.wta.org/go-outside/hikes/).
I enjoy getting away on nice country summer [motorcycle rides](https://www.motorcycleroads.com/motorcycle-rides-in/washington). I've had a longstanding interest in [flying](https://www.topgunmovie.com/) since childhood. I took lessons one summer but did not continue. I haven't missed an episode of [Survivor](https://en.wikipedia.org/wiki/Survivor_43) since beginning watching halfway through season 3. I've applied twice. 

I have the desire to be a [continual Learner](https://ln.ht/~ciwchris). I spend too much time listening to [podcasts](https://gist.github.com/ciwchris/b204fbbca6f240b0cf2e789797355e60). But they are informative and keep the mind going while doing others things. Although I miss allowing my mind to wander. I enjoy [Reading](https://bookshelf.christopherlopes.com) well written informative books on a variety of topics.

I strive to make lifelong [healthy decisions](https://ymcainw.org/). I was a runner until an injury. The feeling of the ground under my feet and the rush of endorphins afterward was magical. Now I [volunteer at track events](https://www.spokanesports.org/Indoormeets).

I'm a professional software developer. I work in [.Net](https://dot.net) and follow [Elixir](https://elixir-lang.org/). I continue to learn about [faith](https://www.commonprayerdaily.com/) and what it means in life. I married later in life and am [Learning to be a nourishing Husband](https://www.gottman.com/product/the-seven-principles-for-making-marriage-work/).

### License / attribution

All content is under [Creative Commons CC-BY-SA license](https://creativecommons.org/licenses/by-sa/4.0/), unless stated otherwise.

### About this website

This site is built with [Eleventy](https://www.11ty.dev/). Content and other tools used can be viewed at [https://github.com/ciwchris/blog](https://github.com/ciwchris/blog).

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
