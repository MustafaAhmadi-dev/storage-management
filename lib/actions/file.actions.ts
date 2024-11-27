"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { getCurrentUser } from "./user.actions";
import {
  constructFileUrl,
  getFileType,
  handleError,
  parseStringify,
} from "../utils";

export async function uploadFiles({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) {
  const { databases, storage } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(file.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(file.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create the file");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file!!!");
  }
}

export async function createQueries(
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));
  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }

  return queries;
}

export async function getFiles({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser)
      throw new Error("User not found - while trying to get files!!!");

    const queries = await createQueries(
      currentUser,
      types,
      searchText,
      sort,
      limit
    );

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
}

export async function renameFile({
  name,
  fileId,
  extension,
  path,
}: RenameFileProps) {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename the file");
  }
}

export async function updateFileUsers({
  emails,
  fileId,
  path,
}: UpdateFileUsersProps) {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update the file users");
  }
}

export async function deleteFile({
  bucketFileId,
  path,
  fileId,
}: DeleteFileProps) {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete the file");
  }
}

export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])]
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file: Models.Document) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}

export async function getFileSize({ type }: { type: string }) {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])]
    );

    const fileSize =
      type === "images"
        ? { image: { size: 0, latestDate: "" }, used: 0 }
        : type === "documents"
        ? { document: { size: 0, latestDate: "" }, used: 0 }
        : type === "other"
        ? { other: { size: 0, latestDate: "" }, used: 0 }
        : {
            video: { size: 0, latestDate: "" },
            audio: { size: 0, latestDate: "" },
            used: 0,
          };

    files.documents.forEach((file: Models.Document) => {
      // const fileType = file.type as FileType;
      // fileSize[fileType]!.size += file.size;
      fileSize.used += file.size;
    });

    return parseStringify(fileSize);
  } catch (error) {
    handleError(error, "Error calculating total file size:, ");
  }
}
