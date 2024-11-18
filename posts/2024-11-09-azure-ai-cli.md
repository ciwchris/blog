---
title: "The Book of AI and the Azure AI CLI"
description:
date: 2024-11-09
tags:
  - ai
  - cli
layout: layouts/post.njk
---

### The Book of AI

I came across the [Book of AI](https://thebookof.ai/) buried in a blog post. Mildly interested I
decided to take a look. I'm glad I did!

The Book of AI is documentation about Azure AI Services. Of interest for this post is the portion on
the Azure AI CLI.

First stop was a [post on the creation of the website for the Book of AI using the Azure AI
CLI](https://techcommunity.microsoft.com/blog/aiplatformblog/the-future-of-ai-unlocking-the-power-of-azure-ai-with-the-book-of-ai/4251353).
It got me curious. I began going through the install and getting started guide for the Azure AI CLI.
I already had the required .NET components, so I skipped down to installing the .NET tool.

```shell
dotnet tool install -g Azure.AI.CLI --prerelease
```

Next, the initialize the AI CLI. If you haven't already you will also need to be logged in with the
AZ CLI, part of the install steps I already had.

```shell
ai init openai
```

It seems the "openai" option is currently optional, and I don't know of any other options which can
be specified. Hopefully other options with other AI models will be supported in the future. It is
prerelease after all.

The initialization walks you through all the Azure resources needed to use the CLI.

### Chatting

Once installed you can begin chatting. You can call the CLI with parameters to either ask a
question as part of the command, reference a file containing a question and/or chat interactively.
The same is true when providing a system prompt:

```shell
ai chat --user "What is the capital of France?"
ai chat --user "What is the capital of France." --system "Always answer in French."
ai chat --interactive --question "@question.txt"
ai chat --interactive --question "@question.txt" --system "@system.txt"
```

Additionally, assistants can be created. This allows you to define an AI chat with a set prompt or
reference files for context. To create a new assistant with a prompt referenced in a file:

```shell
ai chat assistant create --name Grammar --instructions "@grammar-instructions.txt"
```

To use the assistant you can list the assistants to find its id and then use that id when
initiating a chat:

```shell
ai chat assistant list
ai chat --assistant-id asst_KryKV4zhMgVfz8OO1QTjScdo --interactive
```

Specifying the id every time you start a chat gets old, so you can set a default assistant for
every time your initiate a chat:

```shell
ai config --set assistant.id asst_erCjkTgoWlmiyEvu6plonEX6
```

The next time you initiate a chat with `ai chat --interactive` it will automatically use the
assistant set.

If needed you can update the assistant:

```shell
ai chat assistant update --instructions "@grammar-instructions.txt" --id asst_erCjkTgoWlmiyEvu6plonEX6
```

To see what assistant is the default:

```shell
ai config @assistant.id
```

If you ever need to clear the default or delete the assistant:

```shell
ai config --clear assistant.id
ai chat assistant delete --id MlAssistant
```

This is all pretty amazing and usually works smoothly. I'm using my Azure Subscription for my MSDN
account, which has \$50 in credits every month. I've been using this as my primary AI chat interface
for a little over a week and so far it has only cost me just over \$1. Overall it has been quite
  helpful and a joy to use.

### Sample applications

There is much more you can do beyond chatting. There are many application templates demonstrating
various functionality using AI. The Azure AI CLI allows you to quickly create a new application
using a template and then run it. To see what applications are available:

```shell
ai dev list --csharp
```

Select one and create it:

```shell
ai dev new openai-chat --csharp
```

Change into the directory and build the project: `dotnet build`.

To run the project you need all of the environment variables with URLs and keys for accessing the
created Azure resources. The way they easily support this is with the AI shell.

```shell
ai dev shell
```

I did have issue in Windows Powershell starting the dev shell. It would not include any of the
environment variables. But it did work fine in various Linux shells.

Once in the shell start the applications: `dotnet run`.

Pretty slick way to easily try things out.

### Text to speech!

I listen to a lot of audio, primarily podcasts. Therefore, any tool to help me convert text to
audio I'm interested in. Unfortunately there is an issue in the Speech SDK on Linux. The issue has
been resolved in the Speech SDK but the Azure AI CLI is still referencing an old version of the
package. Therefore, I was only able to use text to speech on Windows.

First configure it:

```shell
ai speech setup
```

Then begin chatting away:

```shell
ai speech synthesize --interactive
```

There are many voices you can specify when creating audio:

```shell
ai speech synthesize --list-voices | rg ShortName
ai speech synthesize --text "Hello, world!" --voice en-US-SteffanNeural
```

The text can be read from a file and the audio outputted to a file:

```
ai speech synthesize --file hello-world.txt --audio-output hello-world.mp3 --format mp3
```

There is also voice recognition and translation!

### Conclusion

There is much much more. I only scratched the surface. It has already become immensely helpful to
me. I'll continue to poke around and see what else I find helpful. I encourage you to try it out and
experiment. Again, it's in preview. You're likely to run across issues, like I did. I have also
found the documentation to be sparse. Nevertheless I have still have found this tool to be
convenient and helpful.
