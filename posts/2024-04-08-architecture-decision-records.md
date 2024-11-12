---
title: "Architecture Descision Records (ADR)"
description:
date: 2024-04-08
tags:
  - dotnet
  - architecture
  - documentation
layout: layouts/post.njk
---

### What is an ADR

An ADR is a way to document decisions a team makes on a product. There are several standard
templates which can be used. They can be as simple or as complex as desired. [Microsoft has some
recommended ADR
practices](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record).

ADRs do not seem very popular to me, I only hear them come up every once and a while. Perhaps they
are not very exciting so people just do not discuss them, even though they use them.

There are various tools to help manage ADR documents. Most seem outdated, which again makes me
wonder how often ADRs are actually used.

### How to use them in .NET

[Recently I came upon a post introducing me to a .NET tool for managing
ADRs](https://endjin.com/blog/2023/07/architecture-decision-records). I had used ADR occasionally
previously. There was some initial excitement by the team, but it was quickly neglected. Perhaps
this new tooling would be an on ramp for using ADRs more consistently.

To get started install the tool and the list of ADR templates they package up for use:

```
dotnet tool install -g adr
adr templates package set adr.templates
adr templates package install
```

Custom templates can be created, if you desire. List the templates to see which they provide: `adr
templates list`. The template I've used in the past is essentially the "Markdown Architectural
Decision Records (MADR)" template. There seems several flavors of this template floating around the
internet, but they're all very similar.

The template is fairly in-depth, but most of the items are optional to fill out.

To specify the path to store the ADRs create the file `adr.config.json` and add the contents:

```
{
    "path": "./docs/adr"
}
```

First, initialize the ADR environment. This command will not use the config above. Therefore, if you
used a different value above you'll need to include the path in the `init` command as well. Then set
which template the environment will use:

```
adr environment init
adr templates set madr
adr templates show
```

The last command shows details about the selected template. From my experience none of the above
commands are actually needed. If I skip them I end up with the same results. I'm not sure what the
`init` command even does, besides creating a directory.

Now new records can be created:

```
adr new "First decision"
adr new "Second decision"
```

Two new ADRs will be created in the specified directory. The ADRs will be numbered in sequential
order.

That's pretty much it. The tool itself doesn't seem like it brings much value. It seems you can just
as simply download a template and then make a copy every time there is a need for a new ADR.

### Conclusion

Unfortunately the tool did not improve our usage. I suppose adoption comes down to what is required
for most processes, the discipline to do the work. It's all too easy to put off the less interesting
work of documenting the decisions. After all the decision is fresh in our minds. Everyone
understands why the decision was made. The pain only comes later, when memory is a bit fuzzy and
everyone remembers differently, that's if the people who made the decision are even still around.

We've experienced the pain of not remembering why something was done the way it was. Or even trying
to remember exactly how it all works. Everyone scours their emails, messages and issues searching
for an answer.

Perhaps we are too ambitious when we look at the ADR template, endeavoring to fill it in complete,
which then causes us to give up. But something is better than nothing. Therefore maybe a good start will
be just to record a snippet of the decision along with who was part of the team. After all, this
information probably already exists, it only needs to be copied into a standard location.
