import { CreateUserPrams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "com.anslem.fastfood",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async ({
  name,
  email,
  password,
}: CreateUserPrams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Failed to create user");

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl }
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

// export const getMenu = async ({ category, query }: GetMenuParams) => {
//     try {
//         const queries: string[] = [];

//         if(category) queries.push(Query.equal('categories', category));
//         if(query) queries.push(Query.search('name', query));

//         const menus = await databases.listDocuments(
//             appwriteConfig.databaseId,
//             appwriteConfig.menuCollectionId,
//             queries,
//         )

//         return menus.documents;
//     } catch (e) {
//         throw new Error(e as string);
//     }
// }

// export const getCategories = async () => {
//     try {
//         const categories = await databases.listDocuments(
//             appwriteConfig.databaseId,
//             appwriteConfig.categoriesCollectionId,
//         )

//         return categories.documents;
//     } catch (e) {
//         throw new Error(e as string);
//     }
// }
