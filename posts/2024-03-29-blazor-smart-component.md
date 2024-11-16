---
title: "Integrating .NET Smart Combo Box"
description:
date: 2024-03-29
tags:
  - dotnet
  - blazor
  - ai
layout: layouts/post.njk
---

### .NET Smart Components

AI is great. I use it in my development workflow. But how am I supposed to use it in the
applications I develop? It seems intimating. What exactly do I need to know? What do I have to setup
and have running so my application can integrate with an AI?

Enter [.NET Smart Components](https://github.com/dotnet/smartcomponents). Smart Components is a set
of Blazor and MVC components which allows developers to very easily add AI powered components to an
application.

### Smart ComboBox

I found the [Smart
Combo Box](https://github.com/dotnet/smartcomponents/blob/main/docs/smart-combobox.md) the most useful
component, so it is the one I experimented with. It runs entirely local. It allows a user to type in
a select box and a local embedding will be use to run a similarity search using the text typed. It's
very simple to add to an application. Here's what you need to do.

### Getting started

Install the needed NuGet packages. Currently they are prerelease, so make sure you specify that
flag.

```xml
<PackageReference Include="SmartComponents.AspNetCore" Version="0.1.0-preview10147" />
<PackageReference Include="SmartComponents.LocalEmbeddings" Version="0.1.0-preview10147" />
```

Then in `Program.cs` register the needed pieces:

```csharp
builder.Services.AddSmartComponents();
builder.Services.AddSingleton<LocalEmbedder>();
```

In `Program.cs` the embedder needs to be created and populated. The embedder expects an
`IEnumerable` of type `string`. I'm using a repository type which simply returns a list of values.
I'm a fan of the TV show Survivor, so my list is a list of Survivor episode names.

```csharp
public static class SurvivorEpisodeRepository
{
    public static string[] EpisodeNames =
    [
        "The Marooning",
        "The Generation Gap",
        "Quest for Food",
        "Too Little, Too Late?",
        ...
    ];
}
```

The ComboBqx also needs to be created. It requires an API endpoint to call and the search results to
return. The API endpoint will automatically be managed, no other work is needed, other than also
specifying this endpoint on the component.

```csharp
var embedder = app.Services.GetRequiredService<LocalEmbedder>();
var categories = embedder.EmbedRange(SurvivorEpisodeRepository.EpisodeNames);
app.MapSmartComboBox("api/automatic", request => embedder.FindClosest(request.Query, categories));
```

The last piece needed is adding the component to a page. The crucial piece is to specify the same
`Url` as you did above.

```csharp
<SmartComboBox Url="api/automatic" @bind-Value="@episode" />
<div>Selected episode: @episode</div>

@code {
    private string episode = "";
}
```

That's it!

### Manuel endpoint

If you need more control on how the search is performed then you can define the API endpoint
yourself. There isn't anything special about the endpoint. Here we once again use the embedder to
query.

```csharp
app.MapPost("api/manuel", async httpContext =>
{
    var form = await httpContext.Request.ReadFormAsync();
    var inputValue = form["inputValue"].FirstOrDefault() ?? "";

    var embedder = httpContext.RequestServices.GetRequiredService<LocalEmbedder>();
    var categories = embedder.EmbedRange(SurvivorEpisodeRepository.EpisodeNames);
    var request = new SimilarityQuery
    {
        SearchText = inputValue,
    };
    var result = embedder.FindClosest(request, categories);

    await httpContext.Response.WriteAsJsonAsync(result);
});
```

Using this endpoint is similar, the endpoint name must match.

```csharp
<SmartComboBox Url="api/manuel" @bind-Value="@episode" />
<div>Selected episode: @episode</div>

@code {
    private string episode = "";
}
```

### Customizing the search response

The number of suggestions and the similarity sensitivity of the embedder can be configured. For the
automatic endpoint it is specified on the component.

```
<SmartComboBox MaxSuggestions="3" SimilarityThreshold="0.6f" ... />
```

For the manual endpoint is is specified in the endpoint.

```csharp
var request = new SimilarityQuery
{
    SearchText = inputValue,
    MaxResults = 3,
    MinSimilarity = 0.6f
};
```

### Local Embeddings

The embedder is standalone functionality. In this post it is being used with the Smart ComboBox, but
it can be used independently, where ever similarity search will be helpful in an application.

### Conclusion

I am impressed with how easy it was to use this Smart Component. In the real world it will require a
little more planning to determine how the component should be leveraged. And so unfortunately there
is still some friction to integrating it into existing applications. Perhaps once functionality such
as this becomes more popular it's usefulness will be recognised and requested.

