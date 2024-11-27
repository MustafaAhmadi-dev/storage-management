"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import { uploadFiles } from "@/lib/actions/file.actions";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import Thumbnail from "./Thumbnail";

export default function FileUploader({
  accountId,
  className,
  ownerId,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const path = usePathname();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((pervFiles) =>
            pervFiles.filter((perv) => perv.name !== file.name)
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 5 MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        return uploadFiles({ file, ownerId, accountId, path }).then(
          (uploadedFiles) => {
            if (uploadedFiles) {
              setFiles((pervFiles) =>
                pervFiles.filter((f) => f.name !== file.name)
              );
            }

            return toast({
              description: (
                <p className="body-2">
                  <span className="font-semibold">{file.name}</span> was successfully uploaded.
                </p>
              ),
              className: "success-toast",
            });
          }
        );
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  function handleRemoveFiles(
    fileName: string,
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  }

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="Upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </Button>

      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h-4 text-light-100">Uploading...</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    <Image
                      src="/assets/icons/file-loader.gif"
                      alt="Loader"
                      width={80}
                      height={26}
                      unoptimized
                    />
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  alt="remove"
                  width={24}
                  height={24}
                  onClick={(e) => handleRemoveFiles(file.name, e)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
