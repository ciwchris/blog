---
title: "Using ONNX to integrate local AI models into .NET "
description:
date: 2024-08-23
tags:
  - ai
  - onnx
layout: layouts/post.njk
---

### About the example

[ONNX](https://onnxruntime.ai/docs/) allows developers to integrate many different types of
generated models into their application in a generic way.

This content is essentially my experience replicating the content in the article [Build a Generative
AI App in C# with Phi-3 SLM and ONNX written by Chris
Pietschmann](https://build5nines.com/build-a-generative-ai-app-in-c-with-phi-3-mini-llm-and-onnx/).
I originally recreated the example shortly after the article was written on a Windows device. **On
Linux I received an error**. I am now able to recreate the example on Fedora Linux. Here are my
steps.

The example shows how to download a model and then use the model locally, within a .NET console
application, demonstrated via a typical chat application.

### Getting the model

There are a couple ways to download the model. The article uses Git to clone it. When using this
method **you must have Git LFS installed**. This is the route I went on both Windows and Linux. The
other method is to use the
[huggingface-cli](https://huggingface.co/docs/huggingface_hub/en/guides/cli). The CLI is a Python
package. I did not want to set up Python, there I stick with Git.

There are two installation paths for [Git LFS](https://git-lfs.com/) for Linux. It seemed the
simplest approach was using PackageCloud for installation, therefore I selected the [RPM package
route on PackageCloud](https://packagecloud.io/github/git-lfs/install#bash-rpm) and followed the
step:

```shell
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.rpm.sh | sudo bash
```

This adds a new package source, which then allows installation:

```shell
sudo dnf install git-lfs
git lfs install
```

Now we're reading to Git clone a model. The directory being cloned to will need to be used by the
.NET console application we create next:

```shell
git clone https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx ~/projects/onnx/phi-mini-4k
```

### Using the model

Create a new .NET Console application and add the following packages:

```xml
<PackageReference Include="Microsoft.ML.OnnxRuntime" Version="1.19.1" />
<PackageReference Include="Microsoft.ML.OnnxRuntimeGenAI" Version="0.4.0" />
```

**On Linux these are the first versions of the libraries usable**, before these versions I received
errors stating the file could not be loaded. Looking through the GitHub issues I saw a comment on a
similar error stating Linux was not supported yet, and so I assume was my issue with older versions
of the library.

First step is to load the model:

```csharp
var modelPath = "/home/username/projects/onnx/phi-mini-4k/cpu_and_mobile/cpu-int4-rtn-block-32";
var model = new Model(modelPath);
var tokenizer = new Tokenizer(model);
```

Next up, create an agent using a system prompt:

```csharp
var systemPrompt =
    "You are a knowledgeable and friendly assistant. Answer the following question as concisely as possible.";

var allPrompts = new List<string>
{
    $"<|system|>{systemPrompt}<|end|>"
};
```

We then begin a loop for the interactive chat:

```csharp
while (true)
{
  ...
}
```

Within the loop we ask the user to type their question and generate the full prompt to send to the
model:

```csharp
Console.Write("Type Prompt then Press [Enter] or CTRL-C to Exit: ");
var userPrompt = Console.ReadLine();

Console.WriteLine("");
Console.Write("Assistant:");

allPrompts.Add($"<|user|>{userPrompt}<|end|>");
allPrompts.Add("<|assistant|>");
var fullPrompt = string.Join(string.Empty, allPrompts.ToArray());
```

We then set all the parameters for the model. [Reference the documentation for configuration
parameters](https://onnxruntime.ai/docs/genai/reference/config.html#configuration):

```csharp
var tokens = tokenizer.Encode(fullPrompt);
var generatorParams = new GeneratorParams(model);
generatorParams.SetSearchOption("max_length", 1024);
generatorParams.SetSearchOption("past_present_share_buffer", false);
generatorParams.SetInputSequences(tokens);

var fullResponse = new System.Text.StringBuilder();
var generator = new Generator(model, generatorParams);
```

We now read the response and output it:

```csharp
while (!generator.IsDone())
{
    generator.ComputeLogits();
    generator.GenerateNextToken();
    var outputTokens = generator.GetSequence(0);
    var newToken = outputTokens.Slice(outputTokens.Length - 1, 1);
    var output = tokenizer.Decode(newToken);

    // build full response string as it's generated
    fullResponse.Append(output);

    Console.Write(output);
}
```

Finally, we add the answer to our history, so the next question asked has the previous content to
reference and build upon.

```csharp
allPrompts[allPrompts.Count() - 1] = $"<|assistant|>{fullResponse.ToString()}<|end|>";
Console.WriteLine();
```

### Final thoughts

It's surprising how well this runs using the CPU on my 8 year old laptop. I wouldn't want to use it
as a real life solution for even personal use, but useful to experiment with.

I personally do not have reason to use this. But where it does become interesting is that [ONNX
supports scikit-learn
models](https://onnxruntime.ai/docs/get-started/with-python.html#scikit-learn-cv). Therefore, it's
intriguing thinking about creating a custom model with scikit-learn and then using that custom model
in an application.


