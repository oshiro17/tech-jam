import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
 
export default function Page() {
   return (
      <form className="flex w-full max-w-sm">
         <Input type="search" placeholder="検索..." />
         <Button type="submit">検索</Button>
      </form>
   );
}