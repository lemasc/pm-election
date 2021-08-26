import { LoginForm } from "@/types/login";
import { UseFormRegister } from "react-hook-form";

type InputProps = {
  register: UseFormRegister<LoginForm>;
  className: string;
};

export function IDInput({ register, className }: InputProps) {
  return (
    <input
      className={`input text-sm ${className}`}
      type="number"
      placeholder="ป้อนรหัสประจำตัว 5 หลัก"
      {...register("stdID", {
        required: {
          value: true,
          message: "กรุณากรอกรหัสประจำตัว",
        },
        minLength: {
          value: 5,
          message: "กรุณากรอกรหัสประจำตัวให้ครบ 5 ตัว",
        },
        maxLength: {
          value: 5,
          message: "กรุณากรอกรหัสประจำตัวให้ครบ 5 ตัว",
        },
      })}
    />
  );
}

export function IDCardInput({ register, className }: InputProps) {
  return (
    <input
      className={`input text-sm ${className}`}
      type="number"
      placeholder="ป้อนเลขบัตรประชาชน 13 หลัก"
      {...register("stdIDCard", {
        minLength: {
          value: 13,
          message: "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 ตัว",
        },
        maxLength: {
          value: 13,
          message: "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 ตัว",
        },
      })}
    />
  );
}
