# LanX

langX(.lx), this new programming language can perform basic mathematical operations, delcare variables, objects and functions, function nesting and closures, scopes management, shadowing variables and has built-in native functions.

## Installation and Usage

To install langX, follow these steps:

1. Clone the repository: `git clone https://github.com/gurvirbaraich/langX.git`
2. Install dependencies: `yarn`
3. Run langX: `yarn dev <filename>`

## Syntax

The language uses a different syntax than other popular languages.

- Uses `let` keyword to declare a variable.
- Uses `final let` keyword to declare a constant.
- Uses `fn` keyword to declare a function.

<b>NOTE: All functions have implicit return for now.</b>

## Examples

> Example of variable declaration and usage. 
```rust
let num = 10
print("The value of num is " + num)
```

- This example demonstrates how to declare a variable and print its value. The let keyword is used to declare a variable called num and assign it the value 10. The print function is used to output the value of the variable num to the console.

> Example of using negative numbers.
```rust
let a = 10
let b = -5
let c = a + b
print("The sum of " + a + " and " + b + " is " + c)
```
- The code declares two variables, a and b, with values of 10 and -5 respectively. It then adds the two variables together and stores the result in a third variable, c. The code then prints out a message that displays the sum of a and b, which is 5.

> Example of object creation and usage.
```rust
let person = {
  name: "John",
  age: 30,
  city: "New York"
}

print("Name: " + person.name)
print("Age: " + person.age)
print("City: " + person.city)
```
- This example showcases the creation and usage of an object person that contains three properties name, age, and city. The object is defined using the curly braces syntax with the property names and values separated by colons. The values of the properties can be accessed using the dot notation objectName.propertyName.

> Example of function declaration and usage.
```rust
fn square(x) {
  x * x
}

let num = 5
let result = square(num)
print("The square of " + num + " is " + result)
```

- This example showcases the declaration and usage of a simple function square that takes in a single argument x and returns its square. The function is defined using the fn keyword and then called with a number argument num. The returned value from the function is stored in a variable result and then printed using the print function. 

> Example of nested functions and closures.
```rust
fn outerFunc(x) {
  fn innerFunc(y) {
    x + y
  }
  innerFunc
}

let closure = outerFunc(10)
let result = closure(5)
print("The result is " + result)
```
- This example demonstrates how langX handles nested functions and closures. The program defines two functions outerFunc and innerFunc. The innerFunc function is defined inside the outerFunc function.

- When outerFunc is called and passed the argument 10, it creates a closure by returning the innerFunc function. The innerFunc function remembers the value of x (which is 10) even after the outerFunc function has finished executing. This is because innerFunc is a closure that has access to the environment in which it was created.

- The closure is assigned to the variable closure. When closure is called and passed the argument 5, it adds 5 to the remembered value of x (which is 10) and returns the result 15.



> Example of using local and global scopes.
```rust
final let a = 5
final let b = 7

fn add(a, b) {
  a + b
}

print(add(b, a))
```
- This example demonstrates how langX handles variable scope. The program declares two variables a and b outside of the add function. The add function also declares two parameters with the same names a and b.

- When add(b, a) is called and executed, it uses the a and b values passed as parameters to the function, rather than the global variables a and b declared outside of the function. This is because the local variable scope of the function takes precedence over the global variable scope.

- The output of this program is 12, which is the result of adding b (which has a value of 7) and a (which has a value of 5).

## Native Functions

- `print`
  - outputs a message to the console

- `date`
  - `time`
    - A function that returns the number of milliseconds elapsed since the epoch (midnight at the beginning of January 1, 1970)
  
- `typeof`
  - Returns the type of the value or variable, there are these many different types 
    "number" | "string" | "null" | "boolean" | "object" | "native-fn" | "array" | "function"
  
- `Number`
  - Convert a string to a number
