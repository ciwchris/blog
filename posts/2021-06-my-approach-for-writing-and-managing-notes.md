---
title: My approach for writing and managing notes
description:
date: 2021-06-18
tags:
  - notes
  - organization
layout: layouts/post.njk
---

### The issue

I love the idea of notes. A place to collect all the interesting bits of information which I come in contact with and which flow through my mind. But recording, tracking and sharing them always become an obstacle. I've tried numerous system which I end up using for a short period of time after the initial excitement is gone resulting in the lack of motivation to continue to follow the process to manage and share them.

### What to do about this

Reflecting on this behavior my take away was to keep them as simple as possible. For me this meant creating a text file on each device. When I come across something interesting I open up my `everything.md` file in the text editor of choice and add a date for the beginning of the week if one hasn't already been recorded and then paste in the link, text or type out the thought prefixed with tag(s) delineated by colons.

```
Date: 6/13

:shopping:reviews:recommendations: https://news.ycombinator.com/item?id=27219759
:motivation:range:generalist:specialist:
    - https://www.outsideonline.com/2423015/80-20-rule-beginner-mastery-benefits
    - https://www.cell.com/patterns/fulltext/S2666-3899(21)00064-7
:javascript: https://turriate.com/articles/modern-javascript-everything-you-missed-over-10-years
:introvert: https://thehustle.co/why-introverts-make-great-leaders/
:neovim:vim: https://github.com/nvim-telescope/telescope.nvim
:quote:benjamin:franklin: modest diffidence - https://www.goodreads.com/quotes/7971222-i-retained-only-the-habit-of-expressing-my-self-in
:powershell:ignore: --%
:database:testing: https://tsqlt.org/user-guide/quick-start/
:powershell:git:hook: https://gist.github.com/gowon/a36d7622063bd8567f92342f0462ffc5
```

I'm not too concerned about the structure of the notes, I want to keep it simple to lessen any friction for recording the information. The only rules I try to follow are including a weekly date, add at least one tag, and always use singular words for tags.

I've mostly successfully used this system for over a year now.

### The weakness

My primary issue with this system are that the notes are spread across different devices: work laptop, personal laptop and personal phone. I've tried several services to be able to share these files across devices. One major limiting factor in doing so is that my work blocks most file syncing services as well as note taking sites. I therefore need something which is simple, accessible, and doesn't require effort to keep up and running myself.

### Current solution

We use GitHub at work. I have a personal account. Private repositories are now free. I mostly enjoy git. All of this makes for a simple and convenient system for managing my notes. The primary drawback for me is that the file content will not be encrypted at rest, but that was true before, when the files were a text file sitting on each device. They are still this. We trust GitHub with our code at work, therefore I feel fine with my notes also sitting on their servers.

The next issue is that I use a work GitHub account with my work name and email address. I wanted any commits made from work to not include this information and instead including my personal information. To enable this I am using [git config conditional includes][]. My `gitconfig` contains the following:

```
[user]
  name = My Name
  email = my.work.name@example.com
  signingkey = 1234567890abcdef
[includeIf "gitdir:C:/my/note/folder/"]
  path = .gitconfig.personal
```

I then override the `user` settings in the `.gitconfig.personal` file.

```
[user]
  name = My Name
  email = my.personal.name@example.com
  signingkey =
```


I shared access to the repo with my work GitHub account and so I am still committing from my work account but at least the information in the commits now contain my personal information. This is still not ideal but is simple and suffices. Maybe eventually I'll do the work to find a simple approach for managing multiple GitHub accounts on a device.

Next up, how to use GitHub from my phone for cloning the repo and then pulling and pushing commits. I looked at several appfor doing this. With a focus on simplicity I decided to use [mgit][]. The app generates an ssh key when I then can add as a "Deploy key" to the repository with write access. When using the git protocol for the repository URL in mgit then mgit will use the ssh key it generated to access the repository.

Success and Success!

[git config conditional includes]: https://git-scm.com/docs/git-config#_conditional_includes
[mgit]: https://manichord.com/projects/mgit.html

### Potential issues

I don't intend on committing and pushing up a change to a notes file after every edit. Therefore I've renamed each file so they are specific to each device. I therefore can forget to commit any edits for a period of time without worry about any conflicts to resolve when I get around to it. Not committing immediately also means a note I took on a different device may not be present when I need it on another device, but the potential cost of needing to keep them in sync currently outweighs the risk of not having a note available when I need it. If I do experience this scenario I am thinking it will be an infrequent and minor inconvenience, especially since I now work from home.

Since I now have multiple files broken out by device I decide I'd also try breaking up the files by years. I have concerns about the benefits in doing this and whether it was be the source of obstacles, primarily ease of searching. But at this point I will already be searching across files so I'm giving it a try. It's easy enough to stitch them back together if it becomes an issue.

