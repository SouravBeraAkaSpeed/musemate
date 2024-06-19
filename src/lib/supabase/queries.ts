"use server";
import { Interests } from "@prisma/client";
import { db } from "../db";
import { content, contentWithUser, user } from "../types";
import { v4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

export const onBoardUser = async (user: user) => {
  const email = user.email;
  try {
    const res = await db.public_users.update({
      where: {
        email: email,
      },
      data: user,
    });

    return res;
  } catch (error) {
    console.log("[ERROR_ONBOARD_USER]", error);
    return null;
  }
};

export const getLatestTenPost = async (authorId?: string, index?: number) => {
  try {
    const contents = await db.content.findMany({
      where: authorId ? { NOT: { authorId } } : {},
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
      skip: index ?? 0,
      include: {
        author: true,
      },
    });

    const nextIndex = (index ?? 0) + 10;

    return { contents, nextIndex };
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw error;
  }
};

export const filterContentsByFollowing = async (
  contents: contentWithUser[],
  userId?: string
) => {
  try {
    if (!userId) return contents;

    const followedAuthors = await db.userConnection.findMany({
      where: {
        followerId: userId,
      },
      select: {
        userId: true,
      },
    });

    const followedAuthorsIds = followedAuthors.map(
      (connection) => connection.userId
    );

    const filteredContents = contents.filter((content) =>
      followedAuthorsIds.includes(content.authorId)
    );

    return filteredContents;
  } catch (error) {
    console.error("Error filtering contents:", error);
    return null;
  }
};

export const filterContentsByNotFollowing = async (
  contents: contentWithUser[],
  userId?: string
) => {
  try {
    if (!userId) return contents;

    const followedAuthors = await db.userConnection.findMany({
      where: {
        followerId: userId,
      },
      select: {
        userId: true,
      },
    });

    const followedAuthorsIds = followedAuthors.map(
      (connection) => connection.userId
    );

    const filteredContents = contents.filter(
      (content) => !followedAuthorsIds.includes(content.authorId)
    );

    return filteredContents;
  } catch (error) {
    console.error("Error filtering contents:", error);
    return null;
  }
};

export const getContentByCategory = async (category: Interests) => {
  try {
    const contents = await db.content.findMany({
      where: {
        category: {
          has: category,
        },
      },
      include: {
        author: true,
      },
    });

    return contents;
  } catch (error) {
    console.error("Error fetching contents:", error);
    return null;
  }
};

export const getPopularContents = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (twoDaysAgo) {
      const contents = await db.content.findMany({
        where: {
          createdAt: {
            gte: twoDaysAgo,
          },
        },
        orderBy: {
          likes: "desc",
        },
        take: 5,
        include: {
          author: true,
        },
      });

      return contents;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw error;
  }
};

export const followUser = async (
  followerId: string,
  userIdToFollow: string
) => {
  const id = v4();
  try {
    const existingConnection = await db.userConnection.findFirst({
      where: {
        followerId: followerId,
        userId: userIdToFollow,
      },
    });

    if (existingConnection) {
      toast({
        title: "Already Follow the User",
      });
    }

    const newUserConnection = await db.userConnection.create({
      data: {
        id: id,
        followerId: followerId,
        userId: userIdToFollow,
      },
    });

    return newUserConnection;
  } catch (error) {
    console.error("Error following user:", error);
    return null;
  }
};

export const createStory = async (data: content) => {
  try {
    const new_story = await db.content.create({
      data: data,
    });

    return new_story;
  } catch (error) {
    console.log("ERROR_AT_CREATE_STORY", error);
    return null;
  }
};

export const getContent = async (id: string) => {
  try {
    if (id) {
      const content = await db.content.findUnique({
        where: {
          id: id,
        },
        include: {
          author: true,
        },
      });

      return content;
    } else {
      return null;
    }
  } catch (error) {
    console.log("ERROR_AT_GET_CONTENT", error);
    return null;
  }
};

export const getContentByUser = async (id: string) => {
  try {
    if (id) {
      const contents = await db.content.findMany({
        where: {
          authorId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,

        include: {
          author: true,
        },
      });

      return contents;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw error;
  }
};

export const getUserDetails = async (
  id: string | null,
  cursor: string | undefined
) => {
  try {
    // Fetch user data
    if (id) {
      const take = 5;
      const user = await db.public_users.findUnique({
        where: { id: id },
        include: {
          contents: {
            take,
            skip: cursor ? 1 : 0, // Skip the cursor itself if provided
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const contents = user.contents;
      const nextCursor =
        contents.length === take ? contents[take - 1].id : null;

      return { user, contents, nextCursor };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getuserFollowing = async (id: string) => {
  try {
    if (id) {
      const following = await db.userConnection.findMany({
        where: {
          followerId: id,
        },
        select: {
          user: true, // Select only the user details of the followed users
        },
      });

      // Extract the user details from the following results
      const usersFollowing = following.map((follow) => follow.user);
      return { usersFollowing };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const toggleLikeContent = async (userId: string, contentId: string) => {
  try {
    // Check if the user already liked the content
    const existingLike = await db.contentLike.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });

    if (existingLike) {
      // User already liked the content, so unlike it
      await db.contentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Decrement the like count in the content table
      await db.content.update({
        where: { id: contentId },
        data: { likes: { decrement: 1 } },
      });

      return { liked: false };
    } else {
      // User has not liked the content, so like it
      await db.contentLike.create({
        data: {
          userId,
          contentId,
        },
      });

      // Increment the like count in the content table
      await db.content.update({
        where: { id: contentId },
        data: { likes: { increment: 1 } },
      });

      return { liked: true };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const checkIfLiked = async (userId: string, contentId: string) => {
  try {
    const like = await db.contentLike.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });

    return !!like;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to check like status");
  }
};

export const getContentLikes = async (contentId: string) => {
  try {
    const content = await db.content.findUnique({
      where: { id: contentId },
      select: { likes: true },
    });

    if (!content) {
      return null;
    }

    return content.likes;
  } catch (error) {
    console.error(error);
    return null;
  }
};
