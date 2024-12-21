import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request, {params}: {params:{messageid: string}}) {
  await dbConnect();
  const messageId = params.messageid
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  try {
      const updateResult = await UserModel.updateOne(
        {_id: user._id},
        {$pull: {messages: {_id: messageId}}}
      )
      if(updateResult.modifiedCount == 0){
        return Response.json(
          {
            success: false,
            message: "Message Not found",
          },
          { status: 404 }
        );
      }
      return Response.json(
        {
          success: true,
          message: "Message deleted",
        },
        { status: 200 }
      );
      }
   catch (error) {
    console.log("error in delete message", error)
    return Response.json(
      {
        success: false,
        message: "error deleting message",
      },
      { status: 500 }
    );
  }
}
