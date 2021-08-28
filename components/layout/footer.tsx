import { useAuth } from "@/shared/authContext";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();
  const { signOut } = useAuth();
  return (
    <footer className="flex justify-center items-center border p-8 w-full text-gray-500 text-sm bg-white">
      <button
        onClick={async () => {
          if (confirm("คุณต้องการออกจากระบบการลงคะแนนหรือไม่? การดำเนินการทั้งหมดจะถูกละทิ้ง")) {
            await signOut();
            router.replace("/api/logout");
          }
        }}
        title="ออกจากระบบ"
        className="underline"
      >
        ยกเลิกทั้งหมดและออกจากระบบการลงคะแนน
      </button>
    </footer>
  );
}
