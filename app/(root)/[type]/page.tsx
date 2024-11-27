import { Models } from "node-appwrite";
import { getFiles, getFileSize } from "@/lib/actions/file.actions";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import SortBy from "@/components/SortBy";
import Card from "@/components/Card";

export default async function page({ searchParams, params }: SearchParamProps) {
  const type = ((await params).type as string) || "";
  const searchText = (await searchParams)?.query as string;
  const sort = (await searchParams)?.sort as string;
  
  const types = getFileTypesParams(type) as FileType[];

  const [files, fileSize] = await Promise.all([
    getFiles({ types, searchText, sort }),
    getFileSize({ type }),
  ]);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total:{" "}
            <span className="h5">
              {files.documents.length > 0
                ? convertFileSize(fileSize.used, 0)
                : "0 MB"}
            </span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">Sort By</p>
            <SortBy />
          </div>
        </div>
      </section>

      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No Files Uploaded</p>
      )}
    </div>
  );
}
