---
title: Using devcontainers with VS Code and GitHub Codespaces
description:
date: 2023-01-16
tags:
  - vscode
  - dev-container
  - codespaces
  - static-web-apps
  - blazor
layout: layouts/post.njk
---

### The beginning: Creating a Blazor WASM application on both Windows and Linux

I use a Windows machine at work but a Linux machine at home. I do .Net development at work.
Although I'd prefer to development in a different ecosystem at home it is still helpful to be
able to experiment and do some .Net development at home. In theory this should now be possible.
However I always seem to run into issues.

As part of my learning related to work I decided to create a simple shopping list application using
an [Azure Static Website Application][], SWA. I've also wanted to try out WASM, so off I went starting my project.

### How to create the project and the Azure resources

I also was interested in learning how to integrate the [Azure Developer CLI][] (azd). There currently isn't a
template to start from for the project type I wanted to create. Therefore I started out [azd C#
Static Web App template][] to learn from. When I tried provisioning Azure resources stating a
resource was not available in the region I selected. But it did not report which resource it was!
Thankfully I had recently tried deploying an Azure SQL DB recently and remembered it was not
available in the region I normally use. I selected a different region and tried again. Same type of
failure. I was able to eventually determine which other resource it was not happy with in the region
I selected. Finally I was able to successfully provision Azure resources. But a couple days later I
realized I should have looked at the resources the template was creating because the Azure SQL DB
quickly spent all of my credits and locked my account.

I did not give up. I pushed forward and went through the process of customizing the template for my
project. There's a lot in these templates however. So the process took time as I tried to simplify
the template for my project. It was an error prone and lengthy process. Thankfully I never felt
completely stuck and so was able to finally provision all of the resources.

I started my Blazor WASM project from the [Blazor Starter template]. However when I tried to deploy
the application it failed. The resolution was not obvious. Perhaps WASM is not supported by azd for
SWA's. I was exhausted. At this point I just wanted something which worked.

SWA's have their own CLI. It's a convenient way to create, develop and deploy SWAs. Therefore I next
tried this route. However I immediately ran into errors. I don't remember what they were. I didn't
spend time attempting to figure it out.

As a final fallback I used the built in GitHub Actions to deploy the SWA. Thankfully this worked
without issue. Yay!

### Pulled in again with Dev Containers

Azd is still in beta. A recent update included azd usage from [within GitHub Codespaces][], which uses
[Dev Containers][]. I was familiar with the usage of Dev Containers with VS Code but had never used
them before. I figure now was a great time incorporate them.

But how to begin? There's a [Dev Container CLI][]. Yikes! That's more than I wanted to dig into.
There must be a simpler way to get going. How about a template to work from? This looks like a
simple [Dev Container Template][]. I started out with it, and added in my VS Code extensions, which
was what I thought would be the primary benefit of setting up a Dev Container.

I was able to launch a Codespace. But VS Code was recommending extensions which I thought I had
already specified. Unfortunately I had a couple typos and I didn't notice any messages indicating
this. I was able to figure out the issue. Extensions installed!

Except, the [Blazor WASM Debugging extension][]. It reports it cannot be used in a Dev Container. Sigh.

And wait, azd is not installed in the container. I watched the video embedded in the azd
announcement, saw the template they were using for the demo, and examined their Dev Container
configuration. They use a Dockerfile and specify several images in their configuration. I guess it's
going to be more complicated than I had hoped. Well, at least now I have another example template
to work from.

The changes required were not significant and I was up and running soon. First step, logging in. My
user name is the same between my enterprise work and MSDN work accounts. Try as I may I cannot
log into the MSDN account. It turns out the [new version of azd introduced this bug][]. I wonder what
version is installed in the Dev Container. The timing of the report of the bug and its resolution
worked out for me. A fix was quickly in place for me to use. But now I can login but it doesn't know
about my Azure subscription. [A new issue has already been created][]

### Local Dev Container usage

Now every time I start up VS Code it asks if I want to open the project in the Dev Container. That's
sort of annoying. How can I always just open it in the Dev Container? After looking around the Dev
Container should have an _open_ command. But I don't see that command. There are GitHub issues
about this command is missing after an update.

On a whim I uninstalled the Dev Container CLI and instead installed the tool through VS Code and
added the path to the tool in my shell profile. This version does have the _open_ command. I'm
calling it good.

### Conclusion

It feels like it has been a long journey. Longer than it should have been. When things follow the
predetermined path then they work great out of the box. But if you need something different then
prepared to figure things out as you go. It is in beta. And this is all part of the learning
process.

Now I need to try develop using the Dev Container and determine if this process provides added
value, hopefully making it more seamless to develop in Linux and across platforms: Linux, Windows
and Codespaces.


[Azure Static Website Application]: https://learn.microsoft.com/en-us/azure/static-web-apps
[Azure Developer CLI]: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/
[azd C# Static Web App template]: https://github.com/Azure-Samples/todo-csharp-sql-swa-func
[Blazor Starter template]: https://github.com/staticwebdev/blazor-starter
[within GitHub Codespaces]: https://devblogs.microsoft.com/azure-sdk/azure-developer-cli-azd-january-2023-release/#use-the-azure-developer-cli-in-github-codespaces
[Dev Containers]: https://containers.dev/
[Dev Container CLI]: https://code.visualstudio.com/docs/devcontainers/devcontainer-cli
[Dev Container Template]: https://github.com/microsoft/vscode-remote-try-dotnet/blob/main/.devcontainer/devcontainer.json
[Blazor WASM Debugging extension]: https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.blazorwasm-companion
[new version of azd introduced this bug]: https://github.com/Azure/azure-dev/releases/tag/azure-dev-cli_0.5.0-beta.2
[A new issue has already been created]: https://github.com/Azure/azure-dev/issues/1398
