"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { checkExistence, constructDownloadUrl } from "@/lib/utils";
import { actionsDropdownItems } from "@/constants";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FileDetails, ShareInput } from "./ActionsModalContent";

export default function ActionDropdown({ file }: { file: Models.Document }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const path = usePathname();
  const newEmails = emails.concat(file.users);

  async function handleRemoveUser(email: string) {
    if (email === file.owner.email) {
      setError(`You can't delete the owner of the file`);
      return;
    }
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      emails: updatedEmails,
      fileId: file.$id,
      path,
    });
    if (success) setEmails(updatedEmails);
    closeAllModals();
  }

  function closeAllModals() {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setError("");
  }

  async function handleAction() {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ name, fileId: file.$id, extension: file.extension, path }),

      share: () => {
        if (
          checkExistence(file.users, emails) ||
          emails.includes(file.owner.email)
        ) {
          setError(`Has already access to this file`);
          return;
        }

        updateFileUsers({
          emails: newEmails,
          fileId: file.$id,
          path,
        });
        setError("");
      },
      delete: () =>
        deleteFile({ bucketFileId: file.bucketFileId, path, fileId: file.$id }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();
    setIsLoading(false);
  }

  function renderDialogContent() {
    if (!action) return null;

    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle>{label}</DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {value === "details" && <FileDetails file={file} />}

          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
              error={error}
            />
          )}

          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{" "}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>

        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loading"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);
                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value
                  )
                )
                  setIsModalOpen(true);
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
}
