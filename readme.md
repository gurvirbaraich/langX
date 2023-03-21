# LanX

This project is all about creating a programming language. Until now this programming language(langX) can perform basic mathematical operations, delcare variables, objects and functions.

## Installation and Usage

To install langX, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/langX.git`
2. Install dependencies: `yarn`
3. Run langX: `yarn dev <filename>`

## Syntax

The language uses a different syntax than other popular languages.

- Uses `mut` keyword to declare a variable.
- Uses `final mut` keyword to declare a constant.
- Uses `fn` keyword to declare a function.

<b>NOTE: All functions have implicit return for now.</b>

## Examples

```rust
mut x = 5;
mut y = x + 2;

fn add(a, b) {
  a + b;
}

print(add(x, y));
```

```rust
final mut name = "John";

mut person = {
   name,
   age: 30,
   address: {
      city: "New York",
      state: "NY",
      country: "USA"
   }
}

mut country = person.address.country
print(country)
```

## Native Functions

- `print`

  - outputs a message to the console

- `date`
  - `time`
    - A function that returns the number of milliseconds elapsed since the epoch (midnight at the beginning of January 1, 1970)
