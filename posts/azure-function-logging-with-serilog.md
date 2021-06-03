---
title: Logging Azure Function App log entries using Serilog gotchas
description:
date: 2021-05-28
tags:
  - azure fuctions
  - logging
layout: layouts/post.njk
---

### The problem

Azure Functions are great, except logging configuration is not the same as .Net Core applications and there are a number of ways logging can be configured incorrectly which leads to unexpected behavior. One such scenario I recently experienced was sending the Function App logs to Serilog. This was accomplished in start up using the `AddLogging` extension method.

```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Services
    .AddSingleton(Log.Logger)
    .AddLogging(loggingBuilder => loggingBuilder.AddSerilog(dispose: true));
```

This seemingly worked. Maybe. There appeared to be missing log entries at times, they never made it to the sink, so maybe not. This was not investigated further because what we did find was the Function App Information level logging is noisy. We therefore adjusted the log level by updating `host.json`.

```json
{
    "logging": {
        "default": "Warning"
    }
}
```

However, this didn't seem to make any impact. Function App Information level logs were still being written to the sink.

### The resolution

There is a question similar to the problem we experience posted on [Stack Overflow with a helpful answer](https://stackoverflow.com/a/67225369). The reason is not clear, just hints and warnings about when and how logging is used in start up. Instead of using the `AddLogging` extension method registering an `ILoggerProvider` is suggested.

```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Services
    .AddSingleton(Log.Logger)
    .AddSingleton<ILoggingProvider>(new Serilog.Extensions.Logging.SerilogLoggerProvider(Log.Logger, dispose:true));
```

This worked as expected! Thank you [Martin Cerny](https://stackoverflow.com/users/6345585/martin-cerny)!

### Next problem

The Function App logging was no longer noisy, but sometimes it is nice to change the log level and receive lower level log entries. How can this be accomplished without deploying a new version of the Function App?


### Next solution

Azure Functions provide a convenient way of [overriding values in the host file](https://docs.microsoft.com/en-us/azure/azure-functions/functions-host-json#override-hostjson-values). We can therefore use this mechanism to change the log level by adding an Application Setting:

```
AzureFunctionsJobHost__logging__default: Information
```

We once again receive Information level events coming from the Function App. The one drawback to this is that the Function App will be restarted when an Application Setting is added or changed.
