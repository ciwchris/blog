---
title: "Faking time and logs"
description:
date: 2024-03-11
tags:
  - dotnet
  - testing
layout: layouts/post.njk
---

### The problem: framework side effects

Ideally core application logic is written in such a way so that it does not have any side effects.
Unfortunately some .NET framework types produce side effects.

When working with dates and times most commonly static methods are used to retrieve the current date
and time. As a result some wrap these types within another type. Then the new type can be injected
as a dependency. This is not difficult to do, but does require extra work and discipline.

Logging can already be injected as a dependency. The challenging part of logging is asserting
written logs in tests. It's certainly possible to mock logging in tests and then write
verifications. Typically mocking is not ideal. Testing an implementation is brittle. Instead, tests
should focus on the result, which means there should not be side effects. Logging is a somewhat
unique case, so the typical concerns may not apply. But why settle for less, it can be implemented
better.

### Resolutions

#### TimeProvider

Recently .NET gained additions to mitigate both of these issues. For date time there is now a
`TimeProvider` which can be injected. It can then be used in application code,
ex:`timeProvider.GetLocalNow()`.

When testing `FakeTimeProvider` can be used to set a date time, so when the application code
requests a date time a preset value will be used.

```csharp
new FakeTimeProvider(new DateTimeOffset(2023, 7, 15, 13, 25, 13, TimeSpan.FromHours(-7)));
```

#### FakeLogger

For logging there now is a `FakeLogger` which you can create in tests and use when creating an
object to test, ex: `new FakeLogger<SomeService>()`.

Assertions can then be made in tests:

```csharp
var latestLog = logger.Collector.LatestRecord;
Assert.That(latestLog.Level, Is.EqualTo(LogLevel.Error));
```

### Complete example

A simple console application can be setup:

```csharp
public static void Main(string[] args)
{
  var host = new HostBuilder()
    .ConfigureLogging(builder => { builder.AddConsole(); })
    .ConfigureServices(serviceProvider =>
    {
      serviceProvider
        .AddTransient<SomeService>()
        .AddSingleton(TimeProvider.System);
    })
    .Build();

  host.Services.GetRequiredService<SomeService>().DoSomething();
}
```

And an example service which uses `TimeProvider` and `ILogger`:

```csharp
public class SomeService(TimeProvider timeProvider, ILogger<SomeService> logger)
{
  public void DoSomething()
  {
    logger.LogInformation("The time is: {Time}", timeProvider.GetLocalNow());

    try
    {
      throw new NotImplementedException("Causing an error to test logging with exception information");
    }
    catch (NotImplementedException e)
    {
      logger.LogError(e, "The error time is: {Time}", timeProvider.GetLocalNow());
    }
  }
}
```

Then a test can be written for the service which allows the test to control the date time and logger:

```csharp
[Test]
public void FrameworkLogger_FakeLoggerRecordsLogs()
{
  var logger = new FakeLogger<SomeService>();
  var fakeTimeProvider = new FakeTimeProvider(new DateTimeOffset(2023, 7, 15, 13, 25, 13, TimeSpan.FromHours(-7)));
  var service = new SomeService(fakeTimeProvider, logger);

  service.DoSomething();

  Assert.That(logger.Collector.Count, Is.EqualTo(2));

  var firstLog = logger.Collector.GetSnapshot()[0];
  Assert.That(firstLog.Level, Is.EqualTo(LogLevel.Information));
  Assert.That(firstLog.Message, Is.EqualTo("The time is: 07/15/2023 13:25:13 -07:00"));

  var latestLog = logger.Collector.LatestRecord;
  Assert.That(latestLog.Level, Is.EqualTo(LogLevel.Error));
  Assert.That(latestLog.Message, Is.EqualTo("The error time is: 07/15/2023 13:25:13 -07:00"));
  Assert.That(latestLog.Exception?.Message,
    Is.EqualTo("Causing an error to test logging with exception information"));
}
```

### Conclusion

These changes in .NET are very much welcomed. The changes are not significant, but they are
niceties. They simplify tests, remove boilerplate and make tests less brittle. They lead developers
in the right direction.

