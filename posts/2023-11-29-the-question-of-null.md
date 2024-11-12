---
title: "The question of null"
description:
date: 2023-11-29
tags:
  - dotnet
  - design
layout: layouts/post.njk
---

### The past

Null reference exceptions seems to be one of the most common runtime exceptions in .NET. Protecting
against null requires discipline, and a lot of extra code to read through. For .NET Core 3.0, C# 8
the options shifted. At that time a project could be enabled to flag potential nullables not being
handled. The project could also be set to turn these warnings into errors.

```xml
<Nullable>enable</Nullable>
<WarningsAsErrors>nullable</WarningsAsErrors>
```

Along with these setting two new operators were introduced to work with nulls. First, the
null-forgiving operator `!` allows you to instruct the compiler that the object is not null, and so
allows access to any properties: `myStringValue!.Length`. This operator should not be used
haphazardly.

The second operator is the null-conditional operator `?.`. It allows you to access object properties
more succinctly and protect yourself for accessing null by falling through to the end of the
expression if any part of it is null: `myStringValue?.Length ?? 0`.

### How to handle null

Considering this new option I see four general approaches to handling null, all of which have their
trade-offs.

1. Nullables
2. Try pattern
3. Null value pattern
4. Option pattern

In the examples below the following type will be used to return for the example methods:

```csharp
public record TheReturnValue(string TheValue);
```

#### Nullables

We define a method which potentially returns a nullable type:

```csharp
internal class NullableExample
{
    public TheReturnValue? DoSomething(bool useNullPath = false)
    {
        return useNullPath
            ? null
            : new TheReturnValue(nameof(NullableExample));
    }
}
```

Calling and handling the potential null value:

```csharp
var nullableExample = new NullableExample();
Console.WriteLine(nullableExample.DoSomething()?.TheValue ?? "Empty");
Console.WriteLine(nullableExample.DoSomething(useNullPath: true)?.TheValue ?? "Empty");
```

The compiler helps us, to ensure the potential null is not being accessed inappropriately.

#### Try pattern

The try pattern is not new. But the `NutNullWhen` attribute was also only introduced at the same
time as the new null handling operators. Here we define a `Try` method which potentially returns
`null`:

```csharp
internal class TryExample
{
    public bool TryDoSomething([NotNullWhen(true)] out TheReturnValue? theReturnValue, bool useNullPath = false)
    {
        if (useNullPath)
        {
            theReturnValue = null;
            return false;
        }
        else
        {
            theReturnValue = new TheReturnValue(nameof(TryExample));
            return true;
        }
    }
}
```

Calling and handling the potential null value:

```csharp
if (new TryExample().TryDoSomething(out var theTryGetReturnValue))
{
    Console.WriteLine(theTryGetReturnValue.TheValue);
}
if (!new TryExample().TryDoSomething(out var theTryGetReturnValueNullScenario, useNullPath: true))
{
    Console.WriteLine("Empty");
}
```

The approach is a little more awkward. It also does not work with `async` methods.

#### The null value pattern

There isn't anything new about the null value pattern. For this pattern we need to also define a new
type which represents the case when the method does not have a value to return:

```csharp
internal class NullValueExample
{
    public TheReturnValue DoSomething(bool useNullPath = false)
    {
        return useNullPath
            ? new NullValueTheReturnValue()
            : new TheReturnValue(nameof(NullValueExample));
    }
}

internal record NullValueTheReturnValue() : TheReturnValue("Empty");
```

Calling and handling the potential null value:

```csharp
var nullValueExample = new NullValueExample();
Console.WriteLine(nullValueExample.DoSomething().TheValue);
Console.WriteLine(nullValueExample.DoSomething(useNullPath: true).TheValue);
```

Pretty simple and straightforward. The awkwardness comes when you need to know if the object you
have is the null value object.

#### The option pattern

This pattern comes from functional languages. In functional languages it is an elegant solution to
working with `null`. The biggest issue is it's unfamiliarly with developers who work in .NET. It
requires discipline to use.

There are many implementations which can be used. This is a simple implementation which allows an
illustration of usage:

```csharp
internal class Option<T> where T : class
{
    private T? theObject = null;

    public static Option<T> Some(T theObjectPassedIn) => new() { theObject = theObjectPassedIn };
    public static Option<T> None() => new();

    public Option<TResult> Map<TResult>(Func<T, TResult> map) where TResult : class =>
        theObject is null ? Option<TResult>.None() : Option<TResult>.Some(map(theObject));

    public T Reduce(T defaultValue) => theObject ?? defaultValue;
}

internal class OptionExample
{
    public Option<TheReturnValue> DoSomething(bool useNullPath = false)
    {
        return useNullPath
            ? Option<TheReturnValue>.None()
            : Option<TheReturnValue>.Some(new(nameof(OptionExample)));
    }
}
```

Calling and handling the potential null value:

```csharp
var optionExample = new OptionExample();
Console.WriteLine(optionExample.DoSomething().Map(theReturnValue => theReturnValue.TheValue).Reduce("Empty"));
Console.WriteLine(optionExample.DoSomething(useNullPath: true).Map(theReturnValue => theReturnValue.TheValue).Reduce("Empty"));
```

### Conclusion

For most use cases I have found using nullable types with the new nullable settings and operators
makes the most since for where I work. It's still a leaky abstraction, but it is familiar to
.NET developers and mostly protects against `null` simply and sufficiently.
