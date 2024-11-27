import React, { SetStateAction } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function ImageThumbnail({ file }: { file: Models.Document }) {
  return (
    <div className="file-details-thumbnail">
      <Thumbnail type={file.type} extension={file.extension} url={file.url} />

      <div className="flex flex-col">
        <p className="subtitle-2 mb-1">{file.name}</p>
        <FormattedDateTime date={file.$createdAt} className="caption" />
      </div>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <p className="file-details-label text-left">{label}</p>
      <p className="file-details-value text-left">{value}</p>
    </div>
  );
}

export function FileDetails({ file }: { file: Models.Document }) {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
}

type Props = {
  file: Models.Document;
  onInputChange: React.Dispatch<SetStateAction<string[]>>;
  onRemove: (email: string) => void;
  error:string
};
export function ShareInput({ file, onInputChange, onRemove,error }: Props) {
  return (
    <>
      <ImageThumbnail file={file} />
      <p className="pl-1 subtitle-2 text-light-100">Share file with others</p>
      <Input
        type="email"
        placeholder="Enter email address"
        className="share-input-field"
        onChange={(e) => onInputChange(e.target.value.trim().split(","))}
      />
      {error && <p className="text-brand-100 text-sm">{error}</p>}

      <div className="pt-4">
        <div className="flex justify-between">
          <p className="subtitle-2 text-light-100">Shared with</p>
          <p className="subtitle-2 text-light-200">{file.users.length} Users</p>
        </div>

        <ul className="pt-2">
          {file.users.map((email: string) => (
            <li key={email} className="flex items-center justify-between gap-2">
              <p className="subtitle-2">{email}</p>
              <Button
                className="share-remove-user"
                onClick={() => onRemove(email)}
              >
                <Image
                  src="/assets/icons/remove.svg"
                  alt="remove"
                  width={24}
                  height={24}
                  className="remove-icon"
                />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
