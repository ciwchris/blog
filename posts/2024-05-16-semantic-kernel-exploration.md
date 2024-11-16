---
title: "Semantic Kernel exploration"
description:
date: 2024-05-16
tags:
  - dotnet
  - ai
  - semantic-kernel
layout: layouts/post.njk
---

### What is Semantic Kernel

[Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) creates the ability
of easily incorporating AI into an application. It supports several languages. There are many pieces
it provides. I will be discussing Plugins and Planners.

Semantic Kernel supports several models, however not all functionality is supported by every model.
To really leverage its capabilities an OpenAI model needs to be used. Therefore, you will need
access to either an OpenAI API key and model or an Azure OpenAI API key and model. I created an
OpenAI API key for this and chose to use gpt-3.5-turbo, since it was the cheapest.

### The example

I will be creating a sample chat application for banking. The application runs in the terminal.
Users can chat with the AI about customers at the bank. Here's an example chat session:

```
  > Look up customer with last name Smith

 Banking Assistant > ### Customer Information
 | **First Name** | **Last Name** | **Customer Number** |
 |----------------|---------------|---------------------|
 | John           | Smith         | 1234                |

  > What accounts does this customer have

 Banking Assistant > ### Customer's Accounts
 | **Account Number**       | **Account Type** | **Nickname**       | **Balance** |
 |--------------------------|------------------|--------------------|-------------|
 | 123456789                | Savings          | John's Savings     | $1000       |
 | 222222222                | Checking         | John's Checking    | $5000       |
 | 1111-2222-3333-4444      | Credit Card      | John's Credit Card | $500        |

  > I need reverse a transaction for the customer

 Banking Assistant > Could you please provide the account number for the transaction you want to reverse?

  > The Savings account

 Banking Assistant > I will need the amount to reverse from the Savings account. How much do you want to reverse?

  > 10

 Banking Assistant > The transaction has been successfully reversed. Here is the updated information for the Savings account:

 ### Updated Savings Account Information
 | **Account Number** | **Account Type** | **Nickname**    | **Balance** |
 |--------------------|------------------|-----------------|-------------|
 | 123456789          | Savings          | John's Savings  | $990        |

```

I was amazed how well this worked. _This is only a sample, it would need much more work for this to
be considered anything close to an application for a real user._

### Plugins

Plugins essentially allow you to decorate a method in your code which Semantic Kernel recognizes as
functionality an AI can leverage to retrieve specific data. In the example above when the user ask
the AI to lookup a customer the AI by itself would make something up, it doesn't know what is being
asked. But with a plugin you provide the AI visibility to a means for retrieving this specific data.
Here is on the method is defined:

```csharp
[KernelFunction]
[Description("Search for customers by either CustomerNumber or Name")]
public CustomerDetails? SearchForCustomer(
    [Description("The Customer Number of the customer")] string customerNumber,
    [Description("The Name of the customer")] string name)
```

The method name is given an attribute describing what it does. Similarly each parameter is
described. The AI uses these descriptions to determine which Plugin provides the data it is
searching for. I found this approach straightforward. It was easy to pick up and start using.

### Planners

Planners are what allow you to create a workflow for the AI to follow. There are several ways to
define a Planner. The newest way is to once again decorate a method and provide a prompt for the AI
to follow. Finally, a setting needs to be enabled which allows the AI to automatically invoke
functions. _This is functionality only supported by OpenAI models_. Here is how to enable this
functionality:

```csharp
OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new()
{
    ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions
};
```

And this how to define a method for a Planner:

```csharp
[KernelFunction]
[Description("Reverses transactions on a customer's account")]
[return: Description("The list of steps needed to reverse a transaction")]
public async Task<string> ReversalStepsAsync(
    Kernel kernel,
    [Description("The Customer Number of the customer of the account to reverse")] string customerNumber,
    [Description("The Account Number of the transaction to reverse")] string accountNumber,
    [Description("The amount to reverse")] decimal reversalAmount
```

This is the prompt provided to the AI for it to follow:

```csharp
await kernel.InvokePromptAsync($"""
    I need to find a transaction on a customer's account to reverse and then reverse it.
    Before I do that, I need you to ask the user to search for a customer and retireve the customer's {customerNumber}.
    Then display the customer's accounts to the user and ask them to select an {accountNumber}. Then ask for the
    amount to reverse.
""");
```

This planner reverse a transaction on an account. It defines which steps are needed to collect the
data necessary to perform the transaction.

### Agents

The last piece is to define an agent, which essentially means providing a prompt instructing the AI
how to behave. I borrowed my prompt from an example. The important pieces of the prompt for this
usage is instructing the AI to collect all of the pieces it needs to perform a task. We do not want
it to make up pieces of data. For example, in the Planner to reverse a transaction above we want to
ensure the AI ask the user for the customer's account to reverse, and the amount. We do not want it
to make up which account to reverse or how much.

```csharp
"""
You are a friendly assistant who likes to follow the rules. You will complete required steps
and request approval before taking any consequential actions. If the user doesn't provide
enough information for you to complete a task, you will keep asking questions until you have
enough information to complete the task. Provide all data output in a markdown table.
""");
```

### The code

Here are all of the pieces of code necessary. At first look it may seem like a lot, but it's typical
code you would come across in other applications, the attributes are the only additions.

Reference the package:

```xml
<PackageReference Include="Microsoft.SemanticKernel" Version="1.11.1" />
```

Since most of the functionality is prerelease you will receive warnings if you try to use them.
These can be disabled in the project file:

```xml
<NoWarn>SKEXP0060;SKEXP0061;SKEXP0070</NoWarn>
```

`Program.cs` registers everything and initiates the chat:

```csharp
var config = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables()
    .Build();

var collection = new ServiceCollection();
collection.AddSingleton<AccountRepository>();
collection.AddSingleton<CustomerRepository>();

var kernelBuilder = collection.AddKernel();
kernelBuilder.AddOpenAIChatCompletion(config["OpenAI:ModelId"]!, config["OpenAI:ApiKey"]!);
// Add our Plugins and Planners
kernelBuilder.Plugins.AddFromType<CustomerSearch>();
kernelBuilder.Plugins.AddFromType<AccountSearch>();
kernelBuilder.Plugins.AddFromType<TransactionReversal>();

var serviceProvider = collection.BuildServiceProvider();

var kernel = serviceProvider.GetRequiredService<Kernel>();
var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

// Turn on auto calling for the planner
OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new()
{
    ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions
};

ChatHistory chatHistory = new ChatHistory("""
You are a friendly assistant who likes to follow the rules. You will complete required steps
and request approval before taking any consequential actions. If the user doesn't provide
enough information for you to complete a task, you will keep asking questions until you have
enough information to complete the task. Provide all data output in a markdown table.
""");
string? input;

while (true)
{
    Console.Write("\n > ");
    input = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(input))
    {
        // Leaves if the user hits enter without typing any word
        break;
    }
    chatHistory.AddUserMessage(input);
    var chatResult = await chatCompletionService.GetChatMessageContentAsync(chatHistory, openAIPromptExecutionSettings, kernel: kernel);
    Console.Write($"\nBanking Assistant > {chatResult}\n");

    chatHistory.Add(chatResult);
}
```

Here are the Plugins. They are naive, but demonstrate how it works:

```csharp
public class CustomerSearch(CustomerRepository customerRepository)
{
    private readonly CustomerRepository customerRepository = customerRepository;

    [KernelFunction]
    [Description("Search for customers by either CustomerNumber or Name")]
    public CustomerDetails? SearchForCustomer(
        [Description("The Customer Number of the customer")] string customerNumber,
        [Description("The Name of the customer")] string name)
    {
        if (!string.IsNullOrEmpty(customerNumber))
        {
            return customerRepository.SearchByCustomerNumber(customerNumber);
        }
        else if (!string.IsNullOrEmpty(name))
        {
            return customerRepository.SearchByName(name);
        }
        else
        {
            return null;
        }
    }
}

public class AccountSearch(AccountRepository accountRepository)
{
    private readonly AccountRepository accountRepository = accountRepository;

    [KernelFunction]
    [Description("Search for an account belonging to a Customer Number by its Account Number or Nickname")]
    public List<AccountDetails?> SearchForAccount(
        [Description("The Customer Number of the account")] string rimNo,
        [Description("The Account Number of the account")] string accountNumber,
        [Description("The Nickname of the account")] string nickname)
    {
        if (!string.IsNullOrEmpty(accountNumber))
        {
            return [accountRepository.SearchByAccountNumber(rimNo, accountNumber)];
        }
        else if (!string.IsNullOrEmpty(nickname))
        {
            return [accountRepository.SearchByNickname(rimNo, nickname)];
        }
        else
        {
            return accountRepository.SearchByCustomerNumber(customerNumber);
        }

    }
}

public class TransactionReversal(AccountRepository accountRepository)
{
    private readonly AccountRepository accountRepository = accountRepository;

    [KernelFunction]
    [Description("Reverses a credit card transaction on a customer's credit card account")]
    [return: Description("The account reversed")]
    public AccountDetails? ReverseTransaction(
        [Description("The Customer number of the customer of the account to reverse")] string rimNo,
        [Description("The Account Number of the transaction to reverse")] string accountNumber,
        [Description("The amount to reverse")] decimal reversalAmount
    )
    {
        return accountRepository.ReverseAccount(rimNo, accountNumber, reversalAmount);
    }
}
```

And the Planner is similarly defined:

```csharp
public class TransactionReversalPlan
{
    [KernelFunction]
    [Description("Reverses transactions on a customer's account")]
    [return: Description("The list of steps needed to reverse a transaction")]
    public async Task<string> ReversalStepsAsync(
        Kernel kernel,
        [Description("The Customer Number of the customer of the account to reverse")] string customerNumber,
        [Description("The Account Number of the transaction to reverse")] string accountNumber,
        [Description("The amount to reverse")] decimal reversalAmount
    )
    {
        // Prompt the LLM to generate a list of steps to complete the task
        var result = await kernel.InvokePromptAsync($"""
    I need to find a transaction on a customer's account to reverse and then reverse it.
    Before I do that, I need you to ask the user to search for a customer and retireve the customer's {customerNumber}.
    Then display the customer's accounts to the user and ask them to select an {accountNumber}. Then ask for the
    amount to reverse.

    """, new() {
        { "rimNo", rimNo },
        { "accountNumber", accountNumber },
        { "reversalAmount", reversalAmount }
    });

        // Return the plan back to the agent
        return result.ToString();
    }
}
```

Finally, here are the stubbed out types pretending to retrieve the data. In the real world these
would be actual API calls or database calls to get real data.

Here's the repository for retrieving customer data:

```csharp
public record CustomerDetails(string FirstName, string LastName, string CustomerNumber);

public class CustomerRepository
{
    private readonly List<CustomerDetails?> members = [
        new(FirstName: "John", LastName: "Smith", CustomerNumber: "1234"),
        new(FirstName: "Jane", LastName: "Doe", CustomerNumber: "5678")
    ];

    public CustomerDetails? SearchByName(string name) =>
        members.Find(m => m.FirstName.Contains(name) || m.LastName.Contains(name));
    public CustomerDetails? SearchByCustomerNumber(string rimNo) =>
        members.Find(m => m.CustomerNumber == rimNo);
}
```

And here's the repository for retrieving account data:

```csharp
public record AccountDetails(string CustomerNumber, string AccountNumber, string AccountType, string Nickname, decimal Balance);

public class AccountRepository
{
    private readonly List<AccountDetails?> accounts = [
        new(CustomerNumber: "1234", AccountNumber: "123456789", AccountType: "Savings", Nickname: "John's Savings", Balance: 1000),
        new(CustomerNumber: "1234", AccountNumber: "222222222", AccountType: "Checking", Nickname: "John's Checking", Balance: 5000),
        new(CustomerNumber: "1234", AccountNumber: "1111-2222-3333-4444", AccountType: "CreditCard", Nickname: "John's Credit Card", Balance: 500)
        ];

    public List<AccountDetails?> SearchByCustomerNumber(string customerNumber) =>
        accounts.Where(account => account.CustomerNumber == customerNumber).ToList();
    public AccountDetails? SearchByNickname(string customerNumber, string name) =>
        accounts.Find(account => account.CustomerNumber == customerNumber && account.Nickname.Contains(name));
    public AccountDetails? SearchByAccountNumber(string rimNo, string accountNumber) =>
        accounts.Find(account => account.CustomerNumber == rimNo && account.AccountNumber.EndsWith(accountNumber));
    public AccountDetails? ReverseAccount(string customerNumber, string accountNumber, decimal amount)
    {
        var account = accounts.Find(account => account.CustomerNumber == customerNumber && account.AccountNumber.EndsWith(accountNumber));
        if (account is not null) account = account with { Balance = account.Balance - amount };
        return account;
    }
}
```

### Conclusion

That's it! I enjoyed a seamless experience. The implementation is simple but powerful. However, once
again it is simple to get a sample application up and running. It's quite another thing to get an
application such as this ready for use by users in the real world. And certainly the first attempt
would not be an application working with people's financial data!
