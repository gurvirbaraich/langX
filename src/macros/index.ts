import { BooleanValue, FunctionCall, NativeFnValue, NullValue, NumberValue, ObjectValue, RuntimeValue, StringValue } from "../interfaces";

export function MK_NULL(): NullValue {
   return <NullValue>{
      type: "null",
      value: "null"
   }
}

export function MK_BOOL(bool: boolean): BooleanValue {
   return <BooleanValue>{
      value: bool,
      type: "boolean",
   }
}

export function MK_NATIVE_FN(call: FunctionCall) {
   return <NativeFnValue>{
      call: call,
      type: "native-fn"
   }
}

export function MK_OBJECT(values: Map<string, RuntimeValue>): ObjectValue {
   return <ObjectValue>{
      type: "object",
      value: values
   }
}

export function MK_NUMBER(value: number): NumberValue {
   return <NumberValue>{
      value: value,
      type: "number",
   }
}

export function MK_STRING(value: string): StringValue {
   return <StringValue>{
      value: value,
      type: "string",
   }
}